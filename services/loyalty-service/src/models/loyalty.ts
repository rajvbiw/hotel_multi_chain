import mongoose, { Schema } from 'mongoose';

const LoyaltySchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    points: { type: Number, default: 0 },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Trigger helper to compute dynamic customer membership tiers
LoyaltySchema.methods.recalculateTier = function () {
  const spent = this.totalSpent;
  if (spent >= 1000) {
    this.tier = 'Platinum';
  } else if (spent >= 500) {
    this.tier = 'Gold';
  } else if (spent >= 200) {
    this.tier = 'Silver';
  } else {
    this.tier = 'Bronze';
  }
};

export const Loyalty = mongoose.model('Loyalty', LoyaltySchema);
export default Loyalty;
