import Service from "../models/Service.js";

/* ═══════════════════════════════════════════
   PUBLIC CONTROLLERS
═══════════════════════════════════════════ */

// @desc    Get all services (with filters, search, pagination, sort)
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      sort = "newest",
      isActive = "true",
    } = req.query;

    // Build filter
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortTitle: { $regex: search, $options: "i" } },
        { tagline: { $regex: search, $options: "i" } },
        { intro: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Sort map
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      ratingDesc: { rating: -1, reviewsCount: -1 },
      titleAsc: { title: 1 },
    };
    const sortQuery = sortMap[sort] || sortMap.newest;

    const skip = (Number(page) - 1) * Number(limit);

    const [services, total] = await Promise.all([
      Service.find(filter).sort(sortQuery).skip(skip).limit(Number(limit)).lean(),
      Service.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      message: "Services fetched successfully",
      data: services,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error("getServices error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get single service by slug
// @route   GET /api/services/:slug
// @access  Public
export const getServiceBySlug = async (req, res) => {
  try {
    const service = await Service.findOne({
      slug: req.params.slug,
      isActive: true,
    }).lean();

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({
      success: true,
      message: "Service fetched",
      data: service,
    });
  } catch (error) {
    console.error("getServiceBySlug error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get related services (same category, exclude self)
// @route   GET /api/services/related/:slug
// @access  Public
export const getRelatedServices = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 4;

    const current = await Service.findOne({
      slug: req.params.slug,
      isActive: true,
    }).lean();

    if (!current) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    let related = [];

    // 1. Try explicit related slugs first
    if (current.related?.length) {
      related = await Service.find({
        slug: { $in: current.related },
        isActive: true,
      })
        .limit(limit)
        .lean();
    }

    // 2. Fill with same-category
    if (related.length < limit) {
      const excludeSlugs = [current.slug, ...related.map((r) => r.slug)];
      const extra = await Service.find({
        category: current.category,
        slug: { $nin: excludeSlugs },
        isActive: true,
      })
        .sort({ rating: -1, reviewsCount: -1 })
        .limit(limit - related.length)
        .lean();
      related = [...related, ...extra];
    }

    res.status(200).json({
      success: true,
      message: "Related services fetched",
      data: related,
    });
  } catch (error) {
    console.error("getRelatedServices error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get featured services (highest rated)
// @route   GET /api/services/featured
// @access  Public
export const getFeaturedServices = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 4;

    const services = await Service.find({ isActive: true })
      .sort({ rating: -1, reviewsCount: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      message: "Featured services fetched",
      data: services,
    });
  } catch (error) {
    console.error("getFeaturedServices error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all categories with counts
// @route   GET /api/services/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const agg = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const categories = agg.map((c) => ({ name: c._id, count: c.count }));

    res.status(200).json({
      success: true,
      message: "Categories fetched",
      data: categories,
    });
  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ═══════════════════════════════════════════
   ADMIN CONTROLLERS
═══════════════════════════════════════════ */

// @desc    Get single service by ID (includes inactive)
// @route   GET /api/services/id/:id
// @access  Admin
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({
      success: true,
      message: "Service fetched",
      data: service,
    });
  } catch (error) {
    console.error("getServiceById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Create service
// @route   POST /api/services
// @access  Admin
export const createService = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Slug uniqueness
    const existing = await Service.findOne({ slug: payload.slug });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Slug '${payload.slug}' already exists`,
      });
    }

    const service = await Service.create(payload);

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    console.error("createService error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Admin
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    // Slug collision check
    if (payload.slug) {
      const conflict = await Service.findOne({
        slug: payload.slug,
        _id: { $ne: id },
      });
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Slug '${payload.slug}' is already in use`,
        });
      }
    }

    const service = await Service.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({
      success: true,
      message: "Service updated",
      data: service,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    console.error("updateService error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Toggle active status
// @route   PATCH /api/services/:id/toggle
// @access  Admin
export const toggleServiceActive = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json({
      success: true,
      message: `Service ${service.isActive ? "activated" : "deactivated"}`,
      data: service,
    });
  } catch (error) {
    console.error("toggleServiceActive error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete service (soft by default, ?hard=true for permanent)
// @route   DELETE /api/services/:id
// @access  Admin
export const deleteService = async (req, res) => {
  try {
    const { hard } = req.query;

    // Hard delete
    if (hard === "true") {
      const deleted = await Service.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }
      return res.status(200).json({
        success: true,
        message: "Service permanently deleted",
        data: { id: deleted._id },
      });
    }

    // Soft delete
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({
      success: true,
      message: "Service soft-deleted (hidden from public)",
      data: service,
    });
  } catch (error) {
    console.error("deleteService error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Bulk create services
// @route   POST /api/services/bulk
// @access  Admin
export const bulkCreateServices = async (req, res) => {
  try {
    const { services } = req.body;

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Body must contain a non-empty 'services' array",
      });
    }

    if (services.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Maximum 50 services per bulk insert",
      });
    }

    // Internal duplicate check
    const slugs = services.map((s) => s.slug);
    const dupInternal = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    if (dupInternal.length) {
      return res.status(400).json({
        success: false,
        message: `Duplicate slugs in request: ${dupInternal.join(", ")}`,
      });
    }

    // DB duplicate check
    const existing = await Service.find({ slug: { $in: slugs } }).select("slug");
    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: `These slugs already exist: ${existing.map((e) => e.slug).join(", ")}`,
      });
    }

    const created = await Service.insertMany(services, { ordered: true });

    res.status(201).json({
      success: true,
      message: `${created.length} services created`,
      data: created,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed for one or more services",
        errors: Object.values(error.errors).map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }
    console.error("bulkCreateServices error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Upload images (hero + gallery)
// @route   POST /api/services/upload
// @access  Admin
export const uploadServiceImages = async (req, res) => {
  try {
    const files = req.files || {};

    const urls = {
      heroImage: files.heroImage?.[0]
        ? `/uploads/services/${files.heroImage[0].filename}`
        : null,
      gallery: (files.gallery || []).map((f) => `/uploads/services/${f.filename}`),
    };

    if (!urls.heroImage && urls.gallery.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      data: urls,
    });
  } catch (error) {
    console.error("uploadServiceImages error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};