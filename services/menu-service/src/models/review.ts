import mongoose, { Schema } from 'mongoose';

const ReviewSchema = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    menuItemId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export const Review = mongoose.model('Review', ReviewSchema);
export default Review;
