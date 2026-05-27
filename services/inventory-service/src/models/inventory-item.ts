import mongoose, { Schema } from 'mongoose';

const InventoryItemSchema = new Schema(
  {
    branchId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true }, // e.g. 'g', 'ml', 'pcs'
    minThreshold: { type: Number, required: true, default: 1000 }, // Trigger warning if stock falls below this
    supplier: { type: String, default: 'Global Food Distributors Ltd' },
  },
  { timestamps: true }
);

// Form a unique compound index for item name per branch
InventoryItemSchema.index({ branchId: 1, name: 1 }, { unique: true });

export const InventoryItem = mongoose.model('InventoryItem', InventoryItemSchema);
export default InventoryItem;
