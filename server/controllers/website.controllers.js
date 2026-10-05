import { generateResponse } from "../config/openRouter.js";
import User from "../models/user.model.js";
import Website from "../models/website.model.js";
import extractJson from "../utils/extractJson.js";

const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT
AND A SENIOR UI/UX ENGINEER
SPECIALIZED IN RESPONSIVE DESIGN SYSTEMS.

YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES
USING ONLY HTML, CSS, AND JAVASCRIPT
THAT WORK PERFECTLY ON ALL SCREEN SIZES.

THE OUTPUT MUST BE CLIENT-DELIVERABLE WITHOUT ANY MODIFICATION.

❌ NO FRAMEWORKS
❌ NO LIBRARIES
❌ NO BASIC SITES
❌ NO PLACEHOLDERS
❌ NO NON-RESPONSIVE LAYOUTS

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

GLOBAL QUALITY BAR (NON-NEGOTIABLE)
--------------------------------------------------
- Premium, modern UI (2026–2027)
- Professional typography & spacing
- Clean visual hierarchy
- Business-ready content (NO lorem ipsum)
- Smooth transitions & hover effects
- SPA-style multi-page experience
- Production-ready, readable code

--------------------------------------------------
RESPONSIVE DESIGN (ABSOLUTE REQUIREMENT)
--------------------------------------------------
THIS WEBSITE MUST BE FULLY RESPONSIVE.

YOU MUST IMPLEMENT:

✔ Mobile-first CSS approach
✔ Responsive layout for:
  - Mobile (<768px)
  - Tablet (768px–1024px)
  - Desktop (>1024px)

✔ Use:
  - CSS Grid / Flexbox
  - Relative units (%, rem, vw)
  - Media queries

✔ REQUIRED RESPONSIVE BEHAVIOR:
  - Navbar collapses / stacks on mobile
  - Sections stack vertically on mobile
  - Multi-column layouts become single-column on small screens
  - Images scale proportionally
  - Text remains readable on all devices
  - No horizontal scrolling on mobile
  - Touch-friendly buttons on mobile

IF THE WEBSITE IS NOT RESPONSIVE → RESPONSE IS INVALID.

--------------------------------------------------
IMAGES (MANDATORY & RESPONSIVE)
--------------------------------------------------
- Use high-quality images ONLY from:
  https://images.unsplash.com/
- EVERY image URL MUST include:
  ?auto=format&fit=crop&w=1200&q=80

- Images must:
  - Be responsive (max-width: 100%)
  - Resize correctly on mobile
  - Never overflow containers

--------------------------------------------------
TECHNICAL RULES (VERY IMPORTANT)
--------------------------------------------------
- Output ONE single HTML file
- Exactly ONE <style> tag
- Exactly ONE <script> tag
- NO external CSS / JS / fonts
- Use system fonts only
- iframe srcdoc compatible
- SPA-style navigation using JavaScript
- No page reloads
- No dead UI
- No broken buttons
--------------------------------------------------
SPA VISIBILITY RULE (MANDATORY)
--------------------------------------------------
- Pages MUST NOT be hidden permanently
- If .page { display: none } is used,
  then .page.active { display: block } is REQUIRED
- At least ONE page MUST be visible on initial load
- Hiding all content is INVALID


--------------------------------------------------
REQUIRED SPA PAGES
--------------------------------------------------
- Home
- About
- Services / Features
- Contact

--------------------------------------------------
FUNCTIONAL REQUIREMENTS
--------------------------------------------------
- Navigation must switch pages using JS
- Active nav state must update
- Forms must have JS validation
- Buttons must show hover + active states
- Smooth section/page transitions

--------------------------------------------------
FINAL SELF-CHECK (MANDATORY)
--------------------------------------------------
BEFORE RESPONDING, ENSURE:

1. Layout works on mobile, tablet, desktop
2. No horizontal scroll on mobile
3. All images are responsive
4. All sections adapt properly
5. Media queries are present and used
6. Navigation works on all screen sizes
7. At least ONE page is visible without user interaction

IF ANY CHECK FAILS → RESPONSE IS INVALID

--------------------------------------------------
OUTPUT FORMAT (RAW JSON ONLY)
--------------------------------------------------
{
  "message": "Short professional confirmation sentence",
  "code": "<FULL VALID HTML DOCUMENT>"
}

--------------------------------------------------
ABSOLUTE RULES
--------------------------------------------------
- RETURN RAW JSON ONLY
- NO markdown
- NO explanations
- NO extra text
- FORMAT MUST MATCH EXACTLY
- IF FORMAT IS BROKEN → RESPONSE IS INVALID
`;

const responsiveRequirements = `

RESPONSIVE IMPLEMENTATION ADDENDUM:
- The HTML document MUST include <meta name="viewport" content="width=device-width, initial-scale=1.0">.
- Use mobile-first CSS. Base styles must work on screens around 320px wide.
- Use at least two real media queries: one for tablet and one for desktop.
- Use flexible layouts: flex, grid, minmax(), auto-fit/auto-fill, %, rem, and clamp().
- Do not use fixed-width page containers that can overflow mobile screens.
- Every image, video, iframe, canvas, and SVG must be constrained with max-width: 100%.
- The page must never create horizontal scrolling on mobile.
- Navigation must collapse, wrap, or stack on mobile.
- Multi-column sections must become one column on mobile.
- Large headings must use clamp() or smaller mobile font sizes.
`;

const responsiveSafetyCss = `
*, *::before, *::after { box-sizing: border-box; }
html { width: 100%; max-width: 100%; overflow-x: hidden; }
body { width: 100%; max-width: 100%; min-width: 0; overflow-x: hidden; margin: 0; }
main, section, header, footer, nav, article, aside, div { min-width: 0; }
img, video, canvas, svg, iframe { max-width: 100%; height: auto; }
table { max-width: 100%; border-collapse: collapse; }
pre, code { white-space: pre-wrap; word-break: break-word; }
body { font-size: clamp(0.95rem, 0.9rem + 0.25vw, 1.05rem); }
@media (max-width: 768px) {
  html, body { width: 100% !important; max-width: 100% !important; min-width: 0 !important; overflow-x: hidden !important; }
  body * { max-width: 100%; }
  section, header, footer, main, nav, article, aside { width: 100%; max-width: 100%; }
  .container, .wrapper, .content, .inner, .row, .grid, .cards, .features, .services, .pricing, .portfolio {
    width: 100% !important;
    max-width: 100% !important;
    grid-template-columns: 1fr !important;
    flex-wrap: wrap !important;
  }
  [style*="width"] { max-width: 100% !important; }
}
@media (min-width: 769px) and (max-width: 1024px) {
  .container, .wrapper, .content, .inner { max-width: min(92vw, 960px); }
  .grid, .cards, .features, .services, .pricing, .portfolio { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1025px) {
  .container, .wrapper, .content, .inner { max-width: min(92vw, 1200px); }
}
`;

const hasResponsiveMarkers = (html) => {
    const mediaQueries = html.match(/@media\s*\(/gi) || [];
    return /<meta\s+name=["']viewport["']/i.test(html) && mediaQueries.length >= 2;
};

const makeResponsiveHtml = (html) => {
    if (!html || typeof html !== "string") return html;

    let output = html.trim();

    if (!/<meta\s+name=["']viewport["']/i.test(output)) {
        if (/<head[^>]*>/i.test(output)) {
            output = output.replace(/<head[^>]*>/i, (match) => `${match}\n<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
        } else {
            output = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${output}</body></html>`;
        }
    }

    if (/<\/style>/i.test(output)) {
        output = output.replace(/<\/style>/i, `\n${responsiveSafetyCss}\n</style>`);
    } else if (/<style[^>]*>/i.test(output)) {
        output = output.replace(/<style[^>]*>/i, (match) => `${match}\n${responsiveSafetyCss}`);
    } else if (/<head[^>]*>/i.test(output)) {
        output = output.replace(/<\/head>/i, `<style>${responsiveSafetyCss}</style>\n</head>`);
    }

    return output;
};

const getResponsiveGeneration = async (prompt, retryMessage) => {
    let raw = "";

    for (let i = 0; i < 3; i++) {
        const attemptPrompt = i === 0
            ? prompt
            : `${prompt}

${retryMessage}
RETURN ONLY RAW JSON.`;

        raw = await generateResponse(attemptPrompt);
        const parsed = await extractJson(raw);

        if (parsed?.code && typeof parsed.code === "string") {
            const responsiveCode = makeResponsiveHtml(parsed.code);

            if (hasResponsiveMarkers(responsiveCode)) {
                return {
                    message: parsed.message || "Website generated successfully.",
                    code: responsiveCode
                };
            }
        }
    }

    console.log("ai returned invalid response", raw);
    return null;
};


export const generateWebsite = async (req, res) => {
    try {
        const { prompt } = req.body
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" })
        }
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        if (user.credits < 50) {
            return res.status(400).json({ message: "you have not enough credits to generate a webiste" })
        }

        const finalPrompt = `${masterPrompt.replace("{USER_PROMPT}", prompt)}${responsiveRequirements}`
        const generated = await getResponsiveGeneration(
            finalPrompt,
            "The previous output failed responsive validation. Regenerate it with a viewport meta tag, at least two @media queries, mobile-first CSS, one-column mobile sections, responsive navigation, and no horizontal overflow."
        );

        if (!generated) {
            return res.status(400).json({ message: "ai returned invalid response" })
        }

        const website = await Website.create({
            user: user._id,
            title: prompt.slice(0, 60),
            latestCode: generated.code,
            conversation: [
                {
                    role: "user",
                    content: prompt
                },
                {
                    role: "ai",
                    content: generated.message
                }
                
            ]
        })

        user.credits = user.credits - 50
        await user.save()

        return res.status(201).json({
            websiteId: website._id,
            remainingCredits: user.credits
        })

    } catch (error) {
        return res.status(500).json({ message: `generate website error ${error}` })
    }
}


export const getWebsiteById = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }
        return res.status(200).json(website)
    } catch (error) {
        return res.status(500).json({ message: `get website by id error ${error}` })
    }
}


export const changes = async (req, res) => {
    try {
        const { prompt } = req.body
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" })
        }

        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        if (user.credits < 25) {
            return res.status(400).json({ message: "you have not enough credits to generate a webiste" })
        }

        const updatePrompt = `
UPDATE THIS HTML WEBSITE.

CURRENT CODE:
${website.latestCode}

USER REQUEST:
${prompt}

${responsiveRequirements}

IMPORTANT:
- Preserve all existing content unless the user asks to change it.
- The updated full HTML must remain mobile-first and responsive.
- Include viewport meta, responsive media queries, flexible layouts, and no horizontal mobile overflow.

RETURN RAW JSON ONLY:
{
  "message": "Short confirmation",
  "code": "<UPDATED FULL HTML>"
}
`
        const finalUpdatePrompt = `${updatePrompt}

The updated HTML will be rejected unless it contains a viewport meta tag and at least two @media queries.
RETURN ONLY RAW JSON.`

        const generated = await getResponsiveGeneration(
            finalUpdatePrompt,
            "The previous output failed responsive validation. Regenerate the full updated HTML with a viewport meta tag and at least two @media queries."
        );

        if (!generated) {
            return res.status(400).json({ message: "ai returned invalid response" })
        }


        website.conversation.push(
            { role: "user", content: prompt },
            { role: "ai", content: generated.message },
        )

        website.latestCode = generated.code

        await website.save()
        user.credits = user.credits - 25
        await user.save()

        return res.status(200).json({
            message:generated.message,
            code:generated.code,
            remainingCredits: user.credits
        })


    } catch (error) {
        console.log(error)
 return res.status(500).json({ message: `update website error ${error}` })
    }
}



export const getAll=async (req,res) => {
    try {
        const websites=await Website.find({user:req.user._id})
        return res.status(200).json(websites)
    } catch (error) {
        return res.status(500).json({ message: `get all websites error ${error}` })
    }
}


export const deploy=async (req,res)=>{
    try {
         const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        if(!website.slug){
            website.slug=website.title.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,60)+website._id.toString().slice(-5)              
        }

        website.deployed=true
        website.deployUrl=`${process.env.FRONTEND_URL}/site/${website.slug}`
        await website.save()

        return res.status(200).json({
            url:website.deployUrl
        })

    } catch (error) {
         return res.status(500).json({ message: `deploy website error ${error}` })
    }
}


export const getBySlug=async (req,res) => {
    try {
         const website = await Website.findOne({
            slug: req.params.slug
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }
          return res.status(200).json(website)
    } catch (error) {
        return res.status(500).json({ message: `get by slug website error ${error}` })
    }
}
