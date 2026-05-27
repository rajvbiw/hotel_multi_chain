import mongoose, { Schema } from 'mongoose';

const RecipeIngredientSchema = new Schema({
  itemId: { type: String, required: true }, // Links to inventory-service inventoryItem ID
  name: { type: String, required: true },
  quantity: { type: Number, required: true }, // e.g. 50 (grams) or 1 (unit)
  unit: { type: String, required: true }, // e.g. 'g', 'ml', 'pcs'
});

const MenuItemSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    isVegetarian: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    branchIds: [{ type: String }], // Array of Branch IDs where this menu item can be ordered
    nutritionalInfo: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
    ingredients: [RecipeIngredientSchema], // Recipe composition for automated inventory deductions!
  },
  { timestamps: true }
);

export const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
export default MenuItem;
