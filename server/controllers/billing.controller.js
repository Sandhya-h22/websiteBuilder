import crypto from "crypto"
import { PLANS } from "../config/plan.js"
import razorpay from "../config/razorpay.js"
import Payment from "../models/payment.model.js"
import User from "../models/user.model.js"

const creditPaidOrder = async ({ orderId, paymentId }) => {
    const payment = await Payment.findOneAndUpdate(
        {
            razorpayOrderId: orderId,
            creditedAt: { $exists: false }
        },
        {
            $set: {
                razorpayPaymentId: paymentId,
                status: "paid",
                creditedAt: new Date()
            }
        },
        { new: true }
    )

    if (!payment) {
        return Payment.findOne({ razorpayOrderId: orderId })
    }

    await User.findByIdAndUpdate(
        payment.user,
        {
            $inc: { credits: payment.credits },
            $set: { plan: payment.plan }
        },
        { new: true }
    )

    return payment
}

export const billing = async (req, res) => {
    try {
        const { planType } = req.body
        const user = req.user
        const plan = PLANS[planType]

        if (!plan || plan.price === 0) {
            return res.status(400).json({ message: "invalid paid plan" })
        }

        const amount = plan.price * 100
        const receipt = `rcpt_${Date.now()}_${user._id.toString().slice(-8)}`

        const order = await razorpay.orders.create({
            amount,
            currency: "INR",
            receipt,
            notes: {
                userId: user._id.toString(),
                plan: plan.plan,
                credits: String(plan.credits)
            }
        })

        await Payment.create({
            user: user._id,
            razorpayOrderId: order.id,
            amount,
            currency: order.currency,
            plan: plan.plan,
            credits: plan.credits
        })

        return res.status(200).json({
            key: process.env.RAZORPAY_KEY_ID,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            plan: plan.plan,
            credits: plan.credits,
            name: `GenWeb.ai ${planType.toUpperCase()} plan`,
            description: `${plan.credits} credits`,
            prefill: {
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `billing error: ${error}` })
    }
}

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "payment details are required" })
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "invalid payment signature" })
        }

        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
            user: req.user._id
        })

        if (!payment) {
            return res.status(404).json({ message: "payment record not found" })
        }

        await creditPaidOrder({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id
        })

        const user = await User.findById(req.user._id)

        return res.status(200).json({
            message: "payment verified",
            credits: user.credits,
            plan: user.plan
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `payment verification error: ${error}` })
    }
}

export const razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
        const signature = req.headers["x-razorpay-signature"]

        if (!webhookSecret) {
            return res.status(500).json({ message: "razorpay webhook secret is missing" })
        }

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body)
            .digest("hex")

        if (expectedSignature !== signature) {
            return res.status(400).json({ message: "invalid webhook signature" })
        }

        const event = JSON.parse(req.body.toString())
        const paymentEntity = event.payload?.payment?.entity
        const orderEntity = event.payload?.order?.entity

        const orderId = paymentEntity?.order_id || orderEntity?.id
        const paymentId = paymentEntity?.id

        if ((event.event === "payment.captured" || event.event === "order.paid") && orderId) {
            await creditPaidOrder({
                orderId,
                paymentId
            })
        }

        return res.status(200).json({ received: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `razorpay webhook error: ${error}` })
    }
}
