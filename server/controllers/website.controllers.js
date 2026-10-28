import { fastModels, generateResponse } from "../config/openRouter.js";
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

- Use DIFFERENT image URLs for different sections/cards.
- Do NOT repeat the same image URL in multiple places.
- Choose images that match each specific section, service, gallery item, testimonial, or hero.
- Prefer real Unsplash photo URLs like:
  https://images.unsplash.com/photo-...
- Do NOT use generic placeholder images.

- Images must:
  - Be responsive (max-width: 100%)
  - Resize correctly on mobile
  - Never overflow containers

--------------------------------------------------
TECHNICAL RULES (VERY IMPORTANT)
--------------------------------------------------
- Output ONE single HTML file
- The HTML must be complete and valid: <!DOCTYPE html>, <html>, <head>, <body>, closing tags.
- Never output broken visible tag text like nav>, div>, header>, section>, or img>.
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
- Every button, CTA, nav item, mobile menu control, and form submit must do something visible.
- CTA buttons should navigate to a page/section, open contact, scroll, filter content, or show a confirmation.
- Mobile menu buttons must open and close the menu on small screens.
- Do not create decorative buttons without JavaScript behavior.

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
- Product/card/gallery grids must use repeat(auto-fit, minmax(...)) or mobile-first single-column grids.
- Mobile layout must look intentionally designed, not only browser default text and links.
`;

const imageDiversityRequirements = `

IMAGE DIVERSITY ADDENDUM:
- If the website contains more than one image, every image URL MUST be unique.
- Do not reuse the hero image in cards, galleries, service sections, about sections, or backgrounds.
- Match each image to its content. Example: living room, bedroom, kitchen, furniture, decor, office, consultation, team, project gallery.
- Every image must use a complete https://images.unsplash.com/photo-... URL with ?auto=format&fit=crop&w=1200&q=80.
- Do not invent incomplete image URLs. Every <img> src must start with https://images.unsplash.com/photo-.
- If the user asks for 20 images, create at least 20 real <img> elements with unique complete Unsplash URLs.
- All images must keep object-fit: cover or equivalent responsive cropping and must never overflow on mobile.
`;

const interactiveRequirements = `

INTERACTION ADDENDUM:
- Every <button> must be connected to JavaScript behavior using addEventListener, onclick, or a delegated click handler.
- Every nav link must switch SPA pages or scroll to the correct section without reloading the iframe.
- All CTA buttons must perform a useful visible action such as changing page, scrolling, opening contact, or showing a message.
- Contact/newsletter/booking forms must validate required fields and show success/error feedback.
- Mobile navigation must include a working open/close toggle if the nav collapses on mobile.
- The <script> tag must include event listeners for navigation, buttons, forms, and mobile menu behavior.
- Avoid href="#" unless JavaScript prevents default behavior and performs a visible action.
`;

const responsiveSafetyCss = `
*, *::before, *::after { box-sizing: border-box; }
html { width: 100%; max-width: 100%; overflow-x: hidden; }
body { width: 100%; max-width: 100%; min-width: 0; overflow-x: hidden; margin: 0; }
main, section, header, footer, nav, article, aside, div { min-width: 0; }
img, video, canvas, svg, iframe { max-width: 100%; height: auto; }
img { display: block; object-fit: cover; }
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

const hasCompleteHtmlStructure = (html) => {
    const requiredTags = [
        /<html\b/i,
        /<\/html>/i,
        /<head\b/i,
        /<\/head>/i,
        /<body\b/i,
        /<\/body>/i,
        /<style\b[^>]*>[\s\S]*<\/style>/i,
        /<script\b[^>]*>[\s\S]*<\/script>/i
    ];

    const hasRequiredTags = requiredTags.every((pattern) => pattern.test(html));
    const visibleText = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ");
    const hasVisibleBrokenTag = /\b(nav|header|section|footer|main|aside|article|div|button|form|ul|li|img|script|style)>/i.test(visibleText);

    return hasRequiredTags && !hasVisibleBrokenTag;
};

const hasInteractionMarkers = (html) => {
    const hasButtons = /<button\b/i.test(html);
    const hasForms = /<form\b/i.test(html);
    const hasNav = /<nav\b/i.test(html) || /class=["'][^"']*(nav|menu|navbar)/i.test(html);

    if (!hasButtons && !hasForms && !hasNav) return true;

    const scriptMatch = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
    if (!scriptMatch) return false;

    const script = scriptMatch[1];
    const handlesClick = /addEventListener\s*\(\s*["']click["']|onclick\s*=|\.onclick\s*=|onClick/i.test(html);
    const handlesSubmit = !hasForms || /addEventListener\s*\(\s*["']submit["']|onsubmit\s*=|\.onsubmit\s*=|preventDefault\s*\(/i.test(html);
    const hasVisibleAction = /classList|scrollIntoView|style\.display|style\.transform|textContent|innerHTML|alert\s*\(|show|toggle|active|success|error/i.test(script);

    return handlesClick && handlesSubmit && hasVisibleAction;
};

const getImageUrls = (html) => {
    if (!html || typeof html !== "string") return [];

    const urls = [];
    const imgSrcRegex = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
    const cssUrlRegex = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;

    for (const match of html.matchAll(imgSrcRegex)) {
        urls.push(match[1].trim());
    }

    for (const match of html.matchAll(cssUrlRegex)) {
        const url = match[1].trim();
        if (/images\.unsplash\.com/i.test(url)) {
            urls.push(url);
        }
    }

    return urls;
};

const getImgSrcUrls = (html) => {
    if (!html || typeof html !== "string") return [];
    return [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
        .map((match) => match[1].trim());
};

const hasUniqueImages = (html) => {
    const imageUrls = getImageUrls(html);
    if (imageUrls.length <= 1) return true;

    const normalized = imageUrls.map((url) => url.replace(/&amp;/g, "&"));
    return new Set(normalized).size === normalized.length;
};

const hasValidImageUrls = (html, minImages = 0) => {
    const imgSrcUrls = getImgSrcUrls(html);

    if (imgSrcUrls.length < minImages) return false;

    return imgSrcUrls.every((url) => {
        const normalized = url.replace(/&amp;/g, "&");
        return /^https:\/\/images\.unsplash\.com\/photo-/i.test(normalized)
            && /[?&]auto=format\b/i.test(normalized)
            && /[?&]fit=crop\b/i.test(normalized)
            && /[?&]w=1200\b/i.test(normalized)
            && /[?&]q=80\b/i.test(normalized);
    });
};

const hasPolishedLayoutMarkers = (html) => {
    const styleMatch = html.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
    if (!styleMatch) return false;

    const css = styleMatch[1];
    const hasRealCss = css.length > 2500;
    const hasLayout = /display\s*:\s*(grid|flex)/i.test(css) && /gap\s*:/i.test(css);
    const hasResponsiveGrid = /repeat\s*\(\s*(auto-fit|auto-fill)|minmax\s*\(/i.test(css);
    const hasCardStyling = /border-radius\s*:|box-shadow\s*:|background\s*:\s*linear-gradient/i.test(css);
    const hasImageStyling = /object-fit\s*:\s*cover/i.test(css);

    return hasRealCss && hasLayout && hasResponsiveGrid && hasCardStyling && hasImageStyling;
};

const getRequestedImageCount = (prompt) => {
    const normalized = String(prompt || "").toLowerCase();
    const match = normalized.match(/(?:more than|at least|minimum|min)?\s*(\d+)\s+(?:unique\s+)?images?/i);
    if (!match) return 0;

    const count = Number(match[1]);
    if (!Number.isFinite(count)) return 0;

    return normalized.includes("more than") ? count + 1 : count;
};

const validateGeneratedHtml = (html, options = {}) => {
    if (!html || typeof html !== "string") {
        return { ok: false, reason: "missing HTML code" };
    }

    if (!hasCompleteHtmlStructure(html)) {
        return { ok: false, reason: "HTML is incomplete or malformed" };
    }

    if (!hasResponsiveMarkers(html)) {
        return { ok: false, reason: "missing viewport meta tag or at least two media queries" };
    }

    if (!hasUniqueImages(html)) {
        return { ok: false, reason: "duplicate image URLs were used" };
    }

    if (!hasValidImageUrls(html, options.minImages || 0)) {
        return { ok: false, reason: `image URLs are broken/incomplete or fewer than ${options.minImages || 1} valid images were generated` };
    }

    if (!hasInteractionMarkers(html)) {
        return { ok: false, reason: "buttons, navigation, forms, or mobile menu do not have enough JavaScript behavior" };
    }

    if (!hasPolishedLayoutMarkers(html)) {
        return { ok: false, reason: "layout CSS is too basic to be considered a polished responsive website" };
    }

    return { ok: true, reason: "" };
};

const makeResponsiveHtml = (html) => {
    if (!html || typeof html !== "string") return html;

    let output = html.trim();

    if (!/<!doctype\s+html/i.test(output)) {
        output = `<!DOCTYPE html>\n${output}`;
    }

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

const getResponsiveGeneration = async (prompt, retryMessage, options = {}) => {
    let raw = "";
    const attempts = options.attempts || 2;
    let lastReason = "invalid AI response";

    for (let i = 0; i < attempts; i++) {
        const attemptPrompt = i === 0
            ? prompt
            : `${prompt}

${retryMessage}
Previous validation failure: ${lastReason}
RETURN ONLY RAW JSON.`;

        raw = await generateResponse(attemptPrompt, {
            models: options.models,
            maxTokens: options.maxTokens
        });
        const parsed = await extractJson(raw);

        if (!parsed?.code || typeof parsed.code !== "string") {
            lastReason = "response was not valid JSON with a string code field";
            continue;
        }

        if (parsed?.code && typeof parsed.code === "string") {
            const responsiveCode = makeResponsiveHtml(parsed.code);
            const validation = validateGeneratedHtml(responsiveCode, {
                minImages: options.minImages || 0
            });

            if (validation.ok) {
                return {
                    message: parsed.message || "Website generated successfully.",
                    code: responsiveCode
                };
            }

            lastReason = validation.reason;
        }
    }

    console.log("ai returned invalid response", lastReason, raw);
    return { error: lastReason };
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

        const finalPrompt = `${masterPrompt.replace("{USER_PROMPT}", prompt)}${responsiveRequirements}${imageDiversityRequirements}${interactiveRequirements}`
        const generated = await getResponsiveGeneration(
            finalPrompt,
            "The previous output failed validation. Regenerate a complete valid HTML document with no malformed visible tag text, no broken images, polished ecommerce/product-card styling, a viewport meta tag, at least two @media queries, mobile-first CSS, responsive navigation, no horizontal overflow, unique complete Unsplash image URLs, and working JavaScript click/submit handlers.",
            {
                attempts: 3,
                maxTokens: 16000,
                minImages: getRequestedImageCount(prompt)
            }
        );

        if (generated?.error) {
            return res.status(400).json({ message: `ai returned invalid response: ${generated.error}` })
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
${imageDiversityRequirements}
${interactiveRequirements}

IMPORTANT:
- Preserve all existing content unless the user asks to change it.
- The updated full HTML must remain mobile-first and responsive.
- Include viewport meta, responsive media queries, flexible layouts, and no horizontal mobile overflow.
- If adding or replacing images, use unique image URLs. Never repeat the same image URL across multiple cards or sections.
- If the user asks for more images, add varied section-specific images instead of duplicating the existing one.
- Fix broken buttons as part of every update. Buttons, nav links, mobile menu controls, and forms must have working JavaScript handlers.
- Keep all interactions iframe-safe. Do not use page reloads or external navigation for normal SPA actions.

RETURN RAW JSON ONLY:
{
  "message": "Short confirmation",
  "code": "<UPDATED FULL HTML>"
}
`
        const finalUpdatePrompt = `${updatePrompt}

The updated HTML will be rejected unless it contains a viewport meta tag, at least two @media queries, no duplicate image URLs, and working JavaScript event handlers for buttons/nav/forms.
RETURN ONLY RAW JSON.`

        const generated = await getResponsiveGeneration(
            finalUpdatePrompt,
            "The previous output failed validation. Regenerate the full updated HTML with complete valid document structure, polished responsive layout CSS, no malformed visible tag text, no broken images, a viewport meta tag, at least two @media queries, unique complete Unsplash image URLs, and working JavaScript click/submit handlers.",
            {
                attempts: 2,
                models: fastModels,
                minImages: getRequestedImageCount(prompt)
            }
        );

        if (generated?.error) {
            return res.status(400).json({ message: `ai returned invalid response: ${generated.error}` })
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
