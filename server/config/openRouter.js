const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
const models = [
    process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat",
    "apodex/apodex-1.1-mini:free",
    "inclusionai/ling-3.1-flash"
]

export const generateResponse = async (prompt) => {
    const res = await fetch(openRouterUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            models,
            messages: [
                { role: "system", content: "You must return ONLY valid raw JSON." }
                ,
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature:0.2
        }),
    });

if(!res.ok){
    const err=await res.text()
    throw new Error(`OpenRouter is temporarily unavailable or rate-limited. Please retry shortly. Details: ${err}`)
}

const data=await res.json()
return data.choices[0].message.content

}
