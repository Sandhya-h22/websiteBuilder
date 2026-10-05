import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { billing, verifyRazorpayPayment } from "../controllers/billing.controller.js"


const billingRouter=express.Router()

billingRouter.post("/",isAuth,billing)
billingRouter.post("/verify",isAuth,verifyRazorpayPayment)


export default billingRouter
