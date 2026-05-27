import mongoose, { Schema } from 'mongoose';

const OrderItemSchema = new Schema({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const OrderSchema = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    branchId: { type: String, required: true },
    branchName: { type: String, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    orderType: {
      type: String,
      enum: ['dine-in', 'takeaway', 'delivery'],
      required: true,
    },
    tableNumber: { type: String, default: null }, // QR Table ordering context
    deliveryAddress: { type: String, default: null },
    status: {
      type: String,
      enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'PLACED',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      enum: ['CARD', 'CASH', 'UPI'],
      default: 'CARD',
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', OrderSchema);
export default Order;
