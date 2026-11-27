import OpenAI from "openai";
import Service from "../models/Service.js";
import { Membership, Package } from "../models/Package.js";
import Coupon from "../models/Coupon.js";

const CLINIC_INFO = {
  brandName: "Avenue Longevity Retreat",
  phone: process.env.AVENUE_PHONE || "+1 (555) 234-8910",
  email: process.env.AVENUE_EMAIL || "concierge@avenuelongevity.com",
  address: process.env.AVENUE_ADDRESS || "Avenue Longevity Retreat Studio",
  hours: process.env.AVENUE_HOURS || "Daily, 8:00 AM – 8:30 PM (Slots 09:00 AM – 07:30 PM)",
};

const DEFAULT_SERVICES = [
  { title: "Finnish Sauna", category: "Heat", duration: "30–45 min", price: 45 },
  { title: "Cold Plunge", category: "Cold", duration: "10–15 min", price: 40 },
  { title: "Turkish Hammam", category: "Bathing", duration: "60 min", price: 95 },
  { title: "Ceragem Massage Bed", category: "Recovery Tech", duration: "40 min", price: 65 },
  { title: "ExoPod Infrared Bed", category: "Recovery Tech", duration: "30 min", price: 60 },
  { title: "B Pulse Pelvic Chair", category: "Recovery Tech", duration: "30 min", price: 75 },
  { title: "Body Massage", category: "Bodywork", duration: "60 min", price: 110 },
];

const PREFERRED_MODELS = [
  "llama-3.1-8b-instant",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3-32b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
];

let cachedModelId = null;

const isClearlyOffTopic = (text) => {
  const q = text.toLowerCase().trim();

  const websiteKeywords = [
    "avenue", "longevity", "retreat", "sauna", "plunge", "cold", "heat", "hammam",
    "turkish", "ceragem", "massage", "exopod", "infrared", "pulse", "pelvic", "chair",
    "bodywork", "recovery", "tech", "service", "services", "ritual", "rituals",
    "book", "booking", "reserve", "slot", "time", "date", "guest", "membership",
    "memberships", "essential", "signature", "elite", "monthly", "annual", "annually",
    "package", "packages", "credit", "credits", "cart", "checkout", "promo", "code",
    "coupon", "coupons", "discount", "offer", "offers", "price", "pricing", "cost",
    "fee", "payment", "pay", "card", "upi", "net banking", "razorpay", "dashboard",
    "profile", "account", "login", "register", "sign in", "cancel", "cancellation",
    "refund", "policy", "terms", "contact", "phone", "call", "number", "email",
    "mail", "address", "location", "where", "hours", "open", "timing", "remedy",
    "jet lag", "hangover", "energy", "focus", "stress", "stressed", "sore", "sleep",
    "detox", "circulation", "resilience", "lighter", "help", "website", "site", "page"
  ];

  if (websiteKeywords.some((kw) => q.includes(kw))) {
    return false;
  }

  const wellnessFeelings = [
    "tired", "exhausted", "fatigued", "anxious", "anxiety", "stiff", "pain", "ache",
    "aching", "burnout", "insomnia", "bloated", "inflamed", "inflammation", "relax",
    "unwind", "recharge", "restore"
  ];
  if (wellnessFeelings.some((f) => q.includes(f))) {
    return false;
  }

  const offTopicPatterns = [
    /\b(write|debug|code|python|javascript|java|c\+\+|html|css|sql|react|node)\b/i,
    /\b(capital of|president of|prime minister|election|politics|war|stock market|crypto|bitcoin)\b/i,
    /\b(movie|film|song|lyrics|actor|actress|cricket|football|soccer|nba|recipe|cook)\b/i,
    /\b(solve|equation|integral|derivative|homework|essay|poem|joke|story)\b/i,
    /^\s*[\d\s+\-*/().^=]+\s*$/,
  ];

  return offTopicPatterns.some((rx) => rx.test(q));
};

const isAllServicesQuery = (text) => {
  const q = text.toLowerCase();
  return (
    /\b(all|full|complete|every|list of)\b.*\b(service|services|ritual|rituals|treatment|treatments|recovery)\b/i.test(q) ||
    /\b(service|services|ritual|rituals)\s+(list|menu|catalog)\b/i.test(q) ||
    /^(give me|show me|what are)\s+(all\s+)?(the\s+)?(services|rituals)$/i.test(q.trim())
  );
};

const buildServiceItems = (services = []) => {
  return services.map((s) => {
    const priceNum = Number(s.price ?? 0);
    const formattedPrice = `$${priceNum.toLocaleString("en-US")}`;
    const metaParts = [s.duration, formattedPrice].filter(Boolean);
    return {
      title: s.title,
      meta: metaParts.join(" · "),
      href: `/book?service=${encodeURIComponent(s.title)}`,
    };
  });
};

const resolveGroqModel = async (client) => {
  if (process.env.GROQ_MODEL) return process.env.GROQ_MODEL;
  if (cachedModelId) return cachedModelId;

  const list = await client.models.list();
  const available = (list?.data || [])
    .map((m) => m.id)
    .filter(
      (id) =>
        id &&
        !id.includes("whisper") &&
        !id.includes("guard") &&
        !id.includes("tts") &&
        !id.includes("safeguard")
    );

  const picked =
    PREFERRED_MODELS.find((pref) => available.includes(pref)) || available[0];

  if (!picked) {
    throw new Error("No active chat models found on this Groq API key.");
  }

  cachedModelId = picked;
  return picked;
};

const loadLiveCatalog = async () => {
  let services = DEFAULT_SERVICES;
  let memberships = [];
  let packages = [];
  let coupons = [];

  try {
    const dbServices = await Service.find({ isActive: { $ne: false } }).lean();
    if (Array.isArray(dbServices) && dbServices.length > 0) {
      services = dbServices.map((s) => ({
        title: s.title,
        category: s.category || "Ritual",
        duration: s.duration || "",
        price: s.price ?? 0,
        intro: s.intro || "",
      }));
    }
  } catch (e) {}

  try {
    const dbMemberships = await Membership.find({ isActive: { $ne: false } }).lean();
    if (Array.isArray(dbMemberships)) {
      memberships = dbMemberships.map((m) => ({
        name: m.name || m.title,
        priceMonthly: m.priceMonthly ?? m.monthlyPrice ?? m.price ?? 0,
        priceAnnually:
          m.priceAnnually ?? m.annualPrice ?? Math.round((m.priceMonthly ?? m.price ?? 0) * 0.8),
        credits: m.credits ?? m.sessions ?? 0,
        features: Array.isArray(m.features) ? m.features : [],
      }));
    }
  } catch (e) {}

  try {
    const dbPackages = await Package.find({ isActive: { $ne: false } }).lean();
    if (Array.isArray(dbPackages)) {
      packages = dbPackages.map((p) => ({
        name: p.name || p.title,
        price: p.price ?? 0,
        credits: p.credits ?? p.sessions ?? 0,
        description: p.description || p.subtitle || "",
      }));
    }
  } catch (e) {}

  try {
    const now = new Date();
    const dbCoupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: now },
    }).lean();

    if (Array.isArray(dbCoupons)) {
      coupons = dbCoupons
        .filter((c) => c.usageLimit === null || c.usedCount < c.usageLimit)
        .map((c) => ({
          code: c.code,
          discountType: c.discountType,
          discountValue: c.discountValue,
          minPurchaseAmount: c.minPurchaseAmount || 0,
          expiryDate: c.expiryDate,
        }));
    }
  } catch (e) {}

  return { services, memberships, packages, coupons };
};

const buildSystemPrompt = ({ services, memberships, packages, coupons, userContext }) => {
  const todayISO = new Date().toISOString().split("T")[0];

  const servicesBlock = services
    .map(
      (s) =>
        `• ${s.title} | Category: ${s.category} | Duration: ${s.duration || "Session"} | Price: $${s.price}${
          s.intro ? ` | Details: ${s.intro}` : ""
        }`
    )
    .join("\n");

  const membershipsBlock =
    memberships.length > 0
      ? memberships
          .map(
            (m) =>
              `• ${m.name}: $${m.priceMonthly}/mo (Monthly) or $${m.priceAnnually}/mo (Annual, Save 20%)${
                m.credits ? ` · Includes ${m.credits} credits` : ""
              }${m.features.length ? ` · Perks: ${m.features.join(", ")}` : ""}`
          )
          .join("\n")
      : "• Essential ($149/mo or $119/mo annually), Signature ($249/mo or $199/mo annually — Most Popular), Elite ($399/mo or $319/mo annually).";

  const packagesBlock =
    packages.length > 0
      ? packages
          .map(
            (p) =>
              `• ${p.name}: $${p.price}${p.credits ? ` · ${p.credits} session credits` : ""}${
                p.description ? ` · ${p.description}` : ""
              }`
          )
          .join("\n")
      : "• Multi-session credit packages are available and can be added to the Cart Drawer to earn session credits for bookings.";

  const couponsBlock =
    coupons.length > 0
      ? coupons
          .map((c) => {
            const disc =
              c.discountType === "percentage" ? `${c.discountValue}% off` : `$${c.discountValue} off`;
            const minStr = c.minPurchaseAmount > 0 ? ` (Min purchase: $${c.minPurchaseAmount})` : "";
            const expStr = ` (Valid until ${new Date(c.expiryDate).toISOString().split("T")[0]})`;
            return `• Code ${c.code}: ${disc}${minStr}${expStr}`;
          })
          .join("\n")
      : "• No active promotional coupons right now.";

  const userBlock = userContext?.name
    ? `Current Signed-In Guest: ${userContext.name} (Available Session Credits: ${userContext.credits ?? 0})`
    : "Current Guest: Not signed in (guests can browse freely, and sign in at /login when completing a booking or checkout).";

  return `
You are the official AI Concierge for **${CLINIC_INFO.brandName}**. Today's date is ${todayISO}.

${userBlock}

=== STRICT SCOPE RULE ===
You ONLY answer questions related to ${CLINIC_INFO.brandName} and this website. If asked anything unrelated (trivia, coding, math, politics, movies, recipes, etc.), politely decline and redirect to ${CLINIC_INFO.brandName}.

=== CONTACT & STUDIO DETAILS ===
- Brand: ${CLINIC_INFO.brandName}
- Phone: ${CLINIC_INFO.phone}
- Email: ${CLINIC_INFO.email}
- Location: ${CLINIC_INFO.address}
- Hours: ${CLINIC_INFO.hours}

=== LIVE SERVICES & RECOVERY TECH ===
${servicesBlock}

=== MEMBERSHIPS ===
${membershipsBlock}

=== SESSION PACKAGES & CREDITS ===
${packagesBlock}

=== LIVE ACTIVE COUPONS ===
${couponsBlock}

=== WEBSITE FEATURES, PRICING & POLICIES ===
- Booking Flow (/book): Choose a service, date (next 14 days), time slot (09:00 AM – 07:30 PM, up to 4 guests), and confirm. Supports ?service=<Exact Title>.
- Session Credits: 1 credit per guest can be applied at checkout when available ($0 total).
- Payment Methods: Card, UPI, and Net Banking via Razorpay.
- Cart & Checkout (/checkout), Dashboard (/dashboard), Contact (/contact), Terms (/terms), Cancellation Policy (/cancellation), Login (/login).

=== STRUCTURED JSON OUTPUT ===
Respond ONLY with valid JSON (no markdown fences):
{
  "reply": "Short, clear 1-2 sentence intro or summary in plain text (no **asterisks**).",
  "items": [
    {
      "title": "Item or Service Name (e.g. Finnish Sauna)",
      "meta": "Duration & price or key detail (e.g. 45 min · $1,500)",
      "href": "/book?service=Finnish%20Sauna"
    }
  ],
  "actions": [
    { "label": "Short CTA button", "href": "/book" }
  ],
  "followUps": ["Short question 1", "Short question 2"]
}

Rules for "items":
- Whenever listing multiple services, memberships, packages, coupons, or contact details, put EACH item as its own entry in "items" instead of cramming everything into "reply".
- For a service in "items", set "href" to "/book?service=<Exact Service Title>".
- For contact info, list Phone, Email, Hours, and Location as separate rows in "items" (with "href": "/contact").
- For single direct answers (like "How much is Cold Plunge?"), "items" can be [].
`.trim();
};

export const handleChat = async (req, res) => {
  try {
    const { message, history = [], userContext = null } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message.",
      });
    }

    const cleanMessage = message.trim();

    if (isClearlyOffTopic(cleanMessage)) {
      return res.status(200).json({
        success: true,
        reply: `I can only help with ${CLINIC_INFO.brandName}—rituals, recovery tech, memberships, coupons, credits, bookings, policies, or contact details.`,
        items: [
          { title: "Phone", meta: CLINIC_INFO.phone, href: "/contact" },
          { title: "Email", meta: CLINIC_INFO.email, href: "/contact" },
        ],
        actions: [
          { label: "Explore Rituals", href: "/book" },
          { label: "View Memberships", href: "/#memberships" },
        ],
        followUps: ["What services do you offer?", "Any active coupon codes?"],
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GROQ_API_KEY is not configured on the server.",
      });
    }

    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const catalog = await loadLiveCatalog();

    const safeHistory = Array.isArray(history)
      ? history
          .slice(-8)
          .filter(
            (m) =>
              (m?.role === "user" || m?.role === "assistant") &&
              typeof m?.content === "string" &&
              m.content.trim().length > 0
          )
          .map((m) => ({
            role: m.role,
            content: m.content.slice(0, 1000),
          }))
      : [];

    const modelId = await resolveGroqModel(client);

    const completion = await client.chat.completions.create({
      model: modelId,
      temperature: 0.35,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: buildSystemPrompt({ ...catalog, userContext }),
        },
        ...safeHistory,
        { role: "user", content: cleanMessage },
      ],
    });

    const rawContent = completion.choices?.[0]?.message?.content?.trim() || "{}";

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = {
        reply: rawContent.replace(/\*\*/g, ""),
        items: [],
        actions: [],
        followUps: [],
      };
    }

    const askedForAllServices = isAllServicesQuery(cleanMessage);

    const cleanReply = askedForAllServices
      ? `Here are all ${catalog.services.length} available rituals and recovery sessions at ${CLINIC_INFO.brandName}:`
      : (
          parsed.reply ||
          `Welcome to ${CLINIC_INFO.brandName}. How can I assist you today?`
        )
          .replace(/\*\*/g, "")
          .trim();

    const items = askedForAllServices
      ? buildServiceItems(catalog.services)
      : Array.isArray(parsed.items)
      ? parsed.items
          .filter((it) => it && typeof it.title === "string" && it.title.trim())
          .slice(0, 20)
          .map((it) => ({
            title: it.title.replace(/\*\*/g, "").trim(),
            meta: typeof it.meta === "string" ? it.meta.replace(/\*\*/g, "").trim() : "",
            href:
              typeof it.href === "string" && it.href.startsWith("/")
                ? it.href.trim()
                : null,
          }))
      : [];

    const actions = Array.isArray(parsed.actions)
      ? parsed.actions
          .filter((a) => a?.label && a?.href && String(a.href).startsWith("/"))
          .slice(0, 2)
      : [];

    const followUps = Array.isArray(parsed.followUps)
      ? parsed.followUps.filter((f) => typeof f === "string" && f.trim()).slice(0, 2)
      : [];

    return res.status(200).json({
      success: true,
      reply: cleanReply,
      items,
      actions,
      followUps,
    });
  } catch (error) {
    cachedModelId = null;
    console.error("Chat controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Concierge is temporarily unavailable. Please try again shortly.",
    });
  }
};