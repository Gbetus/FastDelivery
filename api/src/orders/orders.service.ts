import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderTrackingEvent, OrderTrackingEventDocument } from './schemas/order-tracking-event.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customersRepo: Repository<Customer>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectModel(OrderTrackingEvent.name)
    private readonly trackingModel: Model<OrderTrackingEventDocument>,
  ) {}

  async createOrderWithAutoAssign(dto: CreateOrderDto) {
    const { customer, wasCreated } = await this.findOrCreateCustomer(dto);
    const assignedDriver = await this.pickDriverWithLeastOrders();

    const order = this.ordersRepo.create({
      customerId: customer.id,
      assignedUserId: assignedDriver.id,
      estado: OrderStatus.PENDIENTE,
      notasPedido: dto.notasPedido?.trim() || null,
    });
    const savedOrder = await this.ordersRepo.save(order);

    return {
      id: savedOrder.id,
      estado: savedOrder.estado,
      notasPedido: savedOrder.notasPedido,
      customer: {
        id: customer.id,
        nombre: customer.nombre,
        telefono: customer.telefono,
        direccionEntrega: customer.direccionEntrega,
      },
      assignedUser: {
        id: assignedDriver.id,
        email: assignedDriver.email,
        nombre: assignedDriver.nombre,
      },
      createdAt: savedOrder.createdAt,
      updatedAt: savedOrder.updatedAt,
      customerDetected: !wasCreated,
    };
  }

  private async findOrCreateCustomer(dto: CreateOrderDto): Promise<{
    customer: Customer;
    wasCreated: boolean;
  }> {
    const normalizedNombre = dto.customerNombre.trim();
    const normalizedDireccion = dto.customerDireccionEntrega.trim();
    const normalizedTelefono = dto.customerTelefono?.trim() || null;

    let customer: Customer | null = null;

    if (normalizedTelefono) {
      customer = await this.customersRepo.findOne({
        where: { telefono: normalizedTelefono },
      });
    }

    if (!customer) {
      customer = await this.customersRepo
        .createQueryBuilder('customer')
        .where('LOWER(customer.nombre) = LOWER(:nombre)', { nombre: normalizedNombre })
        .andWhere('LOWER(customer.direccionEntrega) = LOWER(:direccion)', {
          direccion: normalizedDireccion,
        })
        .getOne();
    }

    if (customer) {
      return { customer, wasCreated: false };
    }

    const newCustomer = this.customersRepo.create({
      nombre: normalizedNombre,
      telefono: normalizedTelefono,
      direccionEntrega: normalizedDireccion,
    });
    const savedCustomer = await this.customersRepo.save(newCustomer);
    return { customer: savedCustomer, wasCreated: true };
  }

  private async pickDriverWithLeastOrders(): Promise<User> {
    const users = await this.usersRepo.find({
      where: { role: UserRole.DELIVERER },
    });
    if (users.length === 0) {
      throw new NotFoundException('No hay repartidores disponibles para asignar');
    }

    const ordersByDriverRaw = await this.ordersRepo
      .createQueryBuilder('order')
      .select('order.assignedUserId', 'driverId')
      .addSelect('COUNT(order.id)', 'total')
      .groupBy('order.assignedUserId')
      .getRawMany<{ driverId: string; total: string }>();

    const loadMap = new Map<string, number>();
    for (const row of ordersByDriverRaw) {
      loadMap.set(String(row.driverId), Number(row.total));
    }

    let minLoad = Number.POSITIVE_INFINITY;
    let candidates: User[] = [];
    for (const user of users) {
      const userLoad = loadMap.get(String(user.id)) ?? 0;
      if (userLoad < minLoad) {
        minLoad = userLoad;
        candidates = [user];
      } else if (userLoad === minLoad) {
        candidates.push(user);
      }
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  async listOrders(userId: string, userRole: UserRole, query: ListOrdersQueryDto) {
    const qb = this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.assignedUser', 'assignedUser')
      .orderBy('order.createdAt', 'DESC');

    if (userRole !== UserRole.ADMIN) {
      qb.andWhere('order.assignedUserId = :userId', { userId });
    }

    if (query.status) {
      qb.andWhere('order.estado = :status', { status: query.status });
    }
    if (query.customer?.trim()) {
      qb.andWhere('LOWER(customer.nombre) LIKE LOWER(:customer)', {
        customer: `%${query.customer.trim()}%`,
      });
    }
    if (query.date) {
      qb.andWhere('DATE(order.createdAt) = :date', { date: query.date });
    }

    const orders = await qb.getMany();

    return orders.map((o) => ({
      id: o.id,
      estado: o.estado,
      notasPedido: o.notasPedido,
      customer: {
        id: o.customer.id,
        nombre: o.customer.nombre,
        telefono: o.customer.telefono,
        direccionEntrega: o.customer.direccionEntrega,
      },
      assignedUser: {
        id: o.assignedUser.id,
        email: o.assignedUser.email,
        nombre: o.assignedUser.nombre,
      },
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));
  }

  async getOrderById(orderId: string, userId: string, userRole: UserRole) {
    const qb = this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.assignedUser', 'assignedUser')
      .where('order.id = :orderId', { orderId });

    if (userRole !== UserRole.ADMIN) {
      qb.andWhere('order.assignedUserId = :userId', { userId });
    }

    const order = await qb.getOne();
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return {
      id: order.id,
      estado: order.estado,
      notasPedido: order.notasPedido,
      customer: {
        id: order.customer.id,
        nombre: order.customer.nombre,
        telefono: order.customer.telefono,
        direccionEntrega: order.customer.direccionEntrega,
      },
      assignedUser: {
        id: order.assignedUser.id,
        email: order.assignedUser.email,
        nombre: order.assignedUser.nombre,
      },
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async listAllWithAssignedDrivers() {
    const orders = await this.ordersRepo.find({
      relations: { customer: true, assignedUser: true },
      order: { createdAt: 'DESC' },
    });

    return orders.map((o) => ({
      id: o.id,
      estado: o.estado,
      notasPedido: o.notasPedido,
      customer: {
        id: o.customer.id,
        nombre: o.customer.nombre,
        telefono: o.customer.telefono,
        direccionEntrega: o.customer.direccionEntrega,
      },
      assignedUser: {
        id: o.assignedUser.id,
        email: o.assignedUser.email,
        nombre: o.assignedUser.nombre,
      },
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));
  }

  async updateStatusForDriver(orderId: string, dto: UpdateOrderStatusDto, driverId: string) {
    const order = await this.ordersRepo.findOne({ where: { id: orderId, assignedUserId: driverId } });
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    const previousStatus = order.estado;
    order.estado = dto.status;
    await this.ordersRepo.save(order);

    await this.trackingModel.create({
      orderId: order.id,
      previousStatus,
      newStatus: dto.status,
      lat: dto.lat,
      lng: dto.lng,
      createdAt: new Date(),
    });

    return {
      id: order.id,
      previousStatus,
      newStatus: order.estado,
      updatedAt: order.updatedAt,
    };
  }

  async getOrderHistoryForDriver(orderId: string, driverId: string) {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId, assignedUserId: driverId },
      relations: { customer: true, assignedUser: true },
    });
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    const events = await this.trackingModel.find({ orderId }).sort({ createdAt: -1 }).lean();

    return {
      order: {
        id: order.id,
        estado: order.estado,
        notasPedido: order.notasPedido,
        customer: {
          id: order.customer.id,
          nombre: order.customer.nombre,
          telefono: order.customer.telefono,
          direccionEntrega: order.customer.direccionEntrega,
        },
        assignedUser: {
          id: order.assignedUser.id,
          email: order.assignedUser.email,
          nombre: order.assignedUser.nombre,
        },
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      events: events.map((e) => ({
        orderId: e.orderId,
        previousStatus: e.previousStatus as OrderStatus,
        newStatus: e.newStatus as OrderStatus,
        location: { lat: e.lat, lng: e.lng },
        timestamp: e.createdAt,
      })),
    };
  }
}
