import { body, param, query } from "express-validator";

const CATEGORIES = ["Heat", "Cold", "Recovery Tech", "Bathing", "Bodywork", "Amenity"];

/* ═══════════════════════════════════════════
   CREATE SERVICE
═══════════════════════════════════════════ */
export const createServiceValidator = [
  body("slug")
    .trim()
    .notEmpty().withMessage("Slug is required")
    .matches(/^[a-z0-9-]+$/).withMessage("Slug must be lowercase letters, numbers and hyphens only")
    .isLength({ min: 2, max: 60 }).withMessage("Slug must be 2–60 chars"),

  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 100 }),
  body("shortTitle").trim().notEmpty().withMessage("Short title is required").isLength({ max: 40 }),
  body("category").isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),
  body("tagline").trim().notEmpty().withMessage("Tagline is required").isLength({ max: 160 }),
  body("duration").trim().notEmpty().withMessage("Duration is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("capacity").trim().notEmpty().withMessage("Capacity is required"),
  body("heroImage").isURL().withMessage("Hero image must be a valid URL"),
  body("intro").trim().notEmpty().withMessage("Intro is required"),

  body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be 0–5"),
  body("reviewsCount").optional().isInt({ min: 0 }),

  body("overview").optional().isArray(),
  body("overview.*").optional().trim().isLength({ max: 1000 }),

  body("included").optional().isArray(),
  body("included.*").optional().trim().isLength({ max: 200 }),

  body("gallery").optional().isArray({ max: 10 }),
  body("gallery.*").optional().isURL().withMessage("Gallery items must be valid URLs"),

  body("related").optional().isArray({ max: 6 }),
  body("related.*").optional().trim().matches(/^[a-z0-9-]+$/),

  body("benefits").optional().isArray(),
  body("benefits.*.icon").optional().trim().isString(),
  body("benefits.*.title").trim().notEmpty().withMessage("Benefit title is required"),
  body("benefits.*.desc").trim().notEmpty().withMessage("Benefit description is required"),

  body("process").optional().isArray(),
  body("process.*.title").trim().notEmpty(),
  body("process.*.desc").trim().notEmpty(),

  body("reviews_list").optional().isArray(),
  body("reviews_list.*.name").trim().notEmpty(),
  body("reviews_list.*.rating").isFloat({ min: 0, max: 5 }),
  body("reviews_list.*.text").trim().notEmpty(),

  body("faqs").optional().isArray(),
  body("faqs.*.q").trim().notEmpty(),
  body("faqs.*.a").trim().notEmpty(),
];

/* ═══════════════════════════════════════════
   UPDATE SERVICE
═══════════════════════════════════════════ */
export const updateServiceValidator = [
  param("id").isMongoId().withMessage("Invalid service ID"),

  body("slug").optional().trim()
    .matches(/^[a-z0-9-]+$/).withMessage("Invalid slug format")
    .isLength({ min: 2, max: 60 }),

  body("title").optional().trim().notEmpty().isLength({ max: 100 }),
  body("shortTitle").optional().trim().notEmpty().isLength({ max: 40 }),
  body("category").optional().isIn(CATEGORIES),
  body("tagline").optional().trim().notEmpty().isLength({ max: 160 }),
  body("duration").optional().trim().notEmpty(),
  body("price").optional().isFloat({ min: 0 }),
  body("capacity").optional().trim().notEmpty(),
  body("heroImage").optional().isURL(),
  body("intro").optional().trim().notEmpty(),
  body("rating").optional().isFloat({ min: 0, max: 5 }),
  body("reviewsCount").optional().isInt({ min: 0 }),
  body("isActive").optional().isBoolean(),
];

/* ═══════════════════════════════════════════
   PARAM VALIDATORS
═══════════════════════════════════════════ */
export const idParamValidator = [
  param("id").isMongoId().withMessage("Invalid service ID"),
];

export const slugParamValidator = [
  param("slug")
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Invalid slug format"),
];

/* ═══════════════════════════════════════════
   LIST QUERY
═══════════════════════════════════════════ */
export const listServicesValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be ≥ 1"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1–100"),
  query("category").optional().isIn(CATEGORIES),
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("sort")
    .optional()
    .isIn(["newest", "oldest", "priceAsc", "priceDesc", "ratingDesc", "titleAsc"]),
  query("search").optional().trim().isLength({ max: 100 }),
  query("isActive").optional().isBoolean(),
];