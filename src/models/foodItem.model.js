import mongoose, { Schema } from "mongoose";

const foodItemSchema = new Schema(
  {
    foodName: {
      type: String,
      unique: true, 
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number, 
      required: true,
      min: [0, "Price must be greater than or equal to 0"],
    },

    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },

    category: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const FoodItem = mongoose.model("FoodItem", foodItemSchema);
