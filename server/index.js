import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"

import connectDb from "./config/db.js"

import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import websiteRouter from "./routes/website.routes.js"
import billingRouter from "./routes/billing.routes.js"

import { razorpayWebhook } from "./controllers/billing.controller.js"

dotenv.config()

const app = express()

app.post(
    "/api/razorpay/webhook",
    express.raw({ type: "application/json" }),
    razorpayWebhook
)

const port = process.env.PORT || 5000

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean)

app.use(express.json())
app.use(cookieParser())

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true
    })
)

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/website", websiteRouter)
app.use("/api/billing", billingRouter)

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
    console.log(`Frontend allowed: ${allowedOrigins.join(", ")}`)
    connectDb()
})
