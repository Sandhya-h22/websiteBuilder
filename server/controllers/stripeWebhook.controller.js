import stripe from "../config/stripe.js";
import User from "../models/user.model.js";

export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    // Verify that the webhook actually came from Stripe
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error("Webhook signature error:", error.message);

        return res.status(400).json({
            message: "Webhook signature verification failed",
        });
    }

    // Handle completed checkout
    if (event.type === "checkout.session.completed") {
        try {
            const session = event.data.object;

            const userId = session.metadata?.userId;
            const credits = Number(session.metadata?.credits);
            const plan = session.metadata?.plan;

            console.log("WEBHOOK METADATA:", {
                userId,
                credits,
                plan,
            });

            // Check required metadata
            if (!userId || !Number.isFinite(credits) || !plan) {
                console.error("Missing or invalid checkout metadata");

                return res.status(400).json({
                    message: "Missing or invalid checkout metadata",
                });
            }

            // Update user's credits and plan
            const user = await User.findByIdAndUpdate(
                userId,
                {
                    $inc: {
                        credits: credits,
                    },
                    $set: {
                        plan: plan,
                    },
                },
                {
                    new: true,
                }
            );

            if (!user) {
                console.error("User not found:", userId);

                return res.status(404).json({
                    message: "User not found",
                });
            }

            console.log("User updated successfully:", user._id);
        } catch (error) {
            console.error("Checkout webhook error:", error);

            return res.status(500).json({
                message: "Failed to process checkout webhook",
            });
        }
    }

    return res.json({
        received: true,
    });
};