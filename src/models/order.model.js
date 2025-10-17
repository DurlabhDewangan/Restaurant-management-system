import mongoose, { Schema } from "mongoose";
import { User } from "./user.model";
import { FoodItem } from "./foodItem.model";

const orderSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [

            {
                foodItem: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "FoodItem",
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                priceAtPurchaseTime:{
                    type:Number,
                    required:true,
                    
                }
            }

        ],

    },
    { timestamps: true }
)