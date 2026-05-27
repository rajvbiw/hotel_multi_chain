import mongoose, { Schema } from 'mongoose';

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    value: { type: Number, required: true }, // e.g. 15 (15%) or 10 ($10 off)
    minOrderValue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model('Coupon', CouponSchema);
export default Coupon;
