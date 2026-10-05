import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    provider: {
        type: String,
        enum: ["razorpay"],
        default: "razorpay"
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String,
        unique: true,
        sparse: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    plan: {
        type: String,
        enum: ["pro", "enterprise"],
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["created", "paid", "failed"],
        default: "created"
    },
    creditedAt: {
        type: Date
    }
}, { timestamps: true })

const Payment = mongoose.model("Payment", paymentSchema)
export default Payment
