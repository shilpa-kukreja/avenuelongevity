// import { Router } from "express";
// import {
//   getServices,
//   getServiceBySlug,
//   getServiceById,
//   getRelatedServices,
//   getFeaturedServices,
//   getCategories,
//   createService,
//   updateService,
//   toggleServiceActive,
//   deleteService,
//   bulkCreateServices,
//   uploadServiceImages,
// } from "../controllers/service.controller.js";

// import {
//   createServiceValidator,
//   updateServiceValidator,
//   idParamValidator,
//   slugParamValidator,
//   listServicesValidator,
// } from "../validators/service.validator.js";

// // ✅ YOUR EXISTING MIDDLEWARE
// import { protect, admin } from "../middleware/authMiddleware.js";
// import { uploadServiceImages as uploadMw } from "../middleware/ServiceMiddleware.js";

// const ServicesRouter = Router();

// /* ═══════════════════════════════════════════
//    PUBLIC ROUTES
// ═══════════════════════════════════════════ */

// // List + Create
// ServicesRouter
//   .route("/")
//   .get(listServicesValidator, getServices)
//   .post(protect, admin, createServiceValidator, createService);

// // Special routes (must come BEFORE /:slug)
// ServicesRouter.get("/categories", getCategories);
// ServicesRouter.get("/featured", getFeaturedServices);
// ServicesRouter.get("/related/:slug", slugParamValidator, getRelatedServices);

// // Admin — get by ID (before /:slug)
// ServicesRouter.get("/id/:id", protect, admin, idParamValidator, getServiceById);

// // Public — get by slug
// ServicesRouter.get("/:slug", slugParamValidator, getServiceBySlug);

// /* ═══════════════════════════════════════════
//    ADMIN ROUTES
// ═══════════════════════════════════════════ */

// // Update
// ServicesRouter.put("/:id", protect, admin, updateServiceValidator, updateService);

// // Toggle active
// ServicesRouter.patch("/:id/toggle", protect, admin, idParamValidator, toggleServiceActive);

// // Delete (soft default, ?hard=true for permanent)
// ServicesRouter.delete("/:id", protect, admin, idParamValidator, deleteService);

// // Bulk create
// ServicesRouter.post("/bulk", protect, admin, bulkCreateServices);

// // Upload images
// ServicesRouter.post("/upload", protect, admin, uploadMw, uploadServiceImages);

// export default ServicesRouter;

import { Router } from "express";
import {
  getServices,
  getServiceBySlug,
  getServiceById,
  getRelatedServices,
  getFeaturedServices,
  getCategories,
  createService,
  updateService,
  toggleServiceActive,
  deleteService,
  bulkCreateServices,
  uploadServiceImages,
} from "../controllers/service.controller.js";

import {
  createServiceValidator,
  updateServiceValidator,
  idParamValidator,
  slugParamValidator,
  listServicesValidator,
} from "../validators/service.validator.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import { uploadServiceImages as uploadMw } from "../middleware/ServiceMiddleware.js";

const ServicesRouter = Router();

// TEMP TESTING FLAG: set to `false` once you want strict login/admin token checks again
const ALLOW_UNAUTH_SERVICE_TESTING = true;

const adminGuard = (req, res, next) => {
  if (ALLOW_UNAUTH_SERVICE_TESTING && !req.headers.authorization) {
    req.user = { _id: "test-admin-id", role: "admin", isAdmin: true };
    return next();
  }
  return protect(req, res, () => admin(req, res, next));
};

/* ═══════════════════════════════════════════
   PUBLIC ROUTES
═══════════════════════════════════════════ */

ServicesRouter
  .route("/")
  .get(listServicesValidator, getServices)
  .post(adminGuard, createServiceValidator, createService);

ServicesRouter.get("/categories", getCategories);
ServicesRouter.get("/featured", getFeaturedServices);
ServicesRouter.get("/related/:slug", slugParamValidator, getRelatedServices);

ServicesRouter.get("/id/:id", adminGuard, idParamValidator, getServiceById);
ServicesRouter.get("/:slug", slugParamValidator, getServiceBySlug);

/* ═══════════════════════════════════════════
   ADMIN ROUTES
═══════════════════════════════════════════ */

ServicesRouter.put("/:id", adminGuard, updateServiceValidator, updateService);
ServicesRouter.patch("/:id/toggle", adminGuard, idParamValidator, toggleServiceActive);
ServicesRouter.delete("/:id", adminGuard, idParamValidator, deleteService);
ServicesRouter.post("/bulk", adminGuard, bulkCreateServices);
ServicesRouter.post("/upload", adminGuard, uploadMw, uploadServiceImages);

export default ServicesRouter;