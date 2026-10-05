import { ArrowLeft, Check, Coins, QrCode, Smartphone } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

import { motion } from "motion/react"
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../config';
import { setUserData } from '../redux/userSlice';

const plans = [
    {
        key: "free",
        name: "Free",
        price: "Rs. 0",
        credits: 100,
        description: "Perfect to explore GenWeb.ai",
        features: [
            "AI website generation",
            "Responsive HTML output",
            "Basic animations",
        ],
        popular: false,
        button: "Get Started",
    },
    {
        key: "pro",
        name: "Pro",
        price: "Rs. 499",
        credits: 500,
        description: "For serious creators & freelancers",
        features: [
            "Everything in Free",
            "Faster generation",
            "Edit & regenerate",
        ],
        popular: true,
        button: "Pay with UPI",
    },
    {
        key: "enterprise",
        name: "Enterprise",
        price: "Rs. 1499",
        credits: 1000,
        description: "For teams & power users",
        features: [
            "Unlimited iterations",
            "Highest priority",
            "Team collaboration",
            "Dedicated support",
        ],
        popular: false,
        button: "Pay with UPI",
    },
];

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true)
            return
        }

        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

function Pricing() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const [loading, setLoading] = useState(null)

    const handleBuy = async (planKey) => {
        if (!userData) {
            navigate("/")
            return
        }

        if (planKey == "free") {
            navigate("/dashboard")
            return
        }

        setLoading(planKey)

        try {
            const isLoaded = await loadRazorpayScript()

            if (!isLoaded) {
                alert("Unable to load payment gateway. Please try again.")
                setLoading(null)
                return
            }

            const result = await axios.post(`${serverUrl}/api/billing`, { planType: planKey }, { withCredentials: true })
            const order = result.data

            const razorpay = new window.Razorpay({
                key: order.key,
                amount: order.amount,
                currency: order.currency,
                name: "GenWeb.ai",
                description: order.description,
                order_id: order.orderId,
                prefill: order.prefill,
                theme: {
                    color: "#6366f1"
                },
                handler: async (response) => {
                    const verifyResult = await axios.post(`${serverUrl}/api/billing/verify`, response, { withCredentials: true })
                    dispatch(setUserData({
                        ...userData,
                        credits: verifyResult.data.credits,
                        plan: verifyResult.data.plan
                    }))
                    setLoading(null)
                    navigate("/dashboard")
                },
                modal: {
                    ondismiss: () => setLoading(null)
                }
            })

            razorpay.open()
        } catch (error) {
            console.log(error)
            alert(error.response?.data?.message || "Payment failed. Please try again.")
            setLoading(null)
        }
    }

    return (
        <div className='relative min-h-screen overflow-hidden bg-[#050505] text-white px-6 pt-16 pb-24'>

            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]' />
                <div className='absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px]' />
            </div>

            <button className='relative z-10 mb-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition' onClick={() => navigate("/")}>
                <ArrowLeft size={16} />
                Back
            </button>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-4xl mx-auto text-center mb-14"
            >
                <h1 className='text-4xl md:text-5xl font-bold mb-4'> Simple, transparent pricing</h1>
                <p className='text-zinc-400 text-lg'> Buy credits using UPI, QR, Paytm, Google Pay, cards, or net banking.</p>
            </motion.div>

            <div className='relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
                {plans.map((p, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12 }}
                        whileHover={{ y: -14, scale: 1.03 }}
                        className={`relative rounded-3xl p-8 border backdrop-blur-xl transition-all
              ${p.popular
                                ? "border-indigo-500 bg-gradient-to-b from-indigo-500/20 to-transparent shadow-2xl shadow-indigo-500/30"
                                : "border-white/10 bg-white/5 hover:border-indigo-400 hover:bg-white/10"
                            }`}
                    >
                        {p.popular && (
                            <span className='absolute top-5 right-5 px-3 py-1 text-xs rounded-full bg-indigo-500'>Most Popular</span>
                        )}

                        <h1 className='text-xl font-semibold mb-2'>{p.name}</h1>
                        <p className='text-zinc-400 text-sm mb-6'>{p.description}</p>
                        <div className='flex items-end gap-1 mb-4'>
                            <span className='text-4xl font-bold'>{p.price}</span>
                            <span className='text-sm text-zinc-400 mb-1'>/one-time</span>
                        </div>

                        <div className='flex items-center gap-2 mb-8'>
                            <Coins size={18} className='text-yellow-400' />
                            <span className='font-semibold'>{p.credits} Credits</span>
                        </div>

                        {p.key !== "free" && (
                            <div className='mb-8 grid grid-cols-2 gap-3 text-xs text-zinc-300'>
                                <div className='flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2'>
                                    <QrCode size={15} className='text-indigo-300' />
                                    QR / UPI
                                </div>
                                <div className='flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2'>
                                    <Smartphone size={15} className='text-emerald-300' />
                                    Paytm / GPay
                                </div>
                            </div>
                        )}

                        <ul className='space-y-3 mb-10'>
                            {p.features.map((f) => (
                                <li
                                    key={f}
                                    className='flex items-center gap-2 text-sm text-zinc-300'
                                >
                                    <Check size={16} className='text-green-400' />
                                    {f}
                                </li>
                            ))}
                        </ul>


                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            disabled={loading}
                            onClick={() => handleBuy(p.key)}
                            className={`w-full py-3 rounded-xl font-semibold transition
                              ${p.popular
                                    ? "bg-indigo-500 hover:bg-indigo-600"
                                    : "bg-white/10 hover:bg-white/20"
                                } disabled:opacity-60`}
                        >
                            {loading === p.key ? "Opening payment..." : p.button}


                        </motion.button>


                    </motion.div>
                ))}
            </div>


        </div>
    )
}

export default Pricing
