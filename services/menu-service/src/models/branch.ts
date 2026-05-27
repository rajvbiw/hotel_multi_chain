import mongoose, { Schema } from 'mongoose';

const BranchSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export const Branch = mongoose.model('Branch', BranchSchema);
export default Branch;
