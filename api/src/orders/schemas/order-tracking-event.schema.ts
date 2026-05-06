import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrderStatus } from '../entities/order.entity';

export type OrderTrackingEventDocument = HydratedDocument<OrderTrackingEvent>;

@Schema({ collection: 'order_tracking_events', versionKey: false })
export class OrderTrackingEvent {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true, enum: OrderStatus })
  previousStatus: OrderStatus;

  @Prop({ required: true, enum: OrderStatus })
  newStatus: OrderStatus;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop({ required: true, default: () => new Date() })
  createdAt: Date;
}

export const OrderTrackingEventSchema = SchemaFactory.createForClass(OrderTrackingEvent);
OrderTrackingEventSchema.index({ orderId: 1, createdAt: -1 });
