import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [

            {
                foodItemId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "FoodItem",
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                priceAtPurchaseTime: {
                    type: Number,
                    required: true,

                }
            }

        ],

        totalAmount: {
            type: Number,
            required: true,
        },

        orderStatus: {
            type: String,
            enum: ["placed", "preparing", "out_for_delivery", "delivered"],
            default: "placed"
        },
        deliveryAddress: {
            type: String,
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ["paid", "unpaid"],
            default: "unpaid"
        }


    },
    { timestamps: true }
)

export const Order = mongoose.model("Order", orderSchema);