import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Customer } from '../customers/entities/customer.entity';
import { User } from '../users/entities/user.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderTrackingEvent, OrderTrackingEventSchema } from './schemas/order-tracking-event.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Customer, User]),
    MongooseModule.forFeature([
      { name: OrderTrackingEvent.name, schema: OrderTrackingEventSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, AdminGuard],
})
export class OrdersModule {}
