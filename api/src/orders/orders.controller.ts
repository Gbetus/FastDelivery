import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrderWithAutoAssign(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  listOrders(
    @Req() req: Request & { user: { id: string; role: UserRole } },
    @Query() query: ListOrdersQueryDto,
  ) {
    return this.ordersService.listOrders(req.user.id, req.user.role, query);
  }

  @Get('with-drivers')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  listAllWithDrivers() {
    return this.ordersService.listAllWithAssignedDrivers();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  getOrderById(@Param('id') id: string, @Req() req: Request & { user: { id: string; role: UserRole } }) {
    return this.ordersService.getOrderById(id, req.user.id, req.user.role);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.ordersService.updateStatusForDriver(id, dto, req.user.id);
  }

  @Get(':id/history')
  @UseGuards(AuthGuard('jwt'))
  history(@Param('id') id: string, @Req() req: Request & { user: { id: string } }) {
    return this.ordersService.getOrderHistoryForDriver(id, req.user.id);
  }
}
