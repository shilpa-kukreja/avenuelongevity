import { ApiError } from "../utils/ApiError.js";

/* Global error handler — must be last middleware */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log for dev
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  }

  // ── Mongoose Bad ObjectId ──
  if (err.name === "CastError") {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // ── Mongoose Duplicate Key ──
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = ApiError.conflict(`Duplicate value for '${field}': ${err.keyValue[field]}`);
  }

  // ── Mongoose Validation ──
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest("Validation failed", errors);
  }

  // ── JWT Errors ──
  if (err.name === "JsonWebTokenError") {
    error = ApiError.unauthorized("Invalid token. Please log in again.");
  }
  if (err.name === "TokenExpiredError") {
    error = ApiError.unauthorized("Token expired. Please log in again.");
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/* 404 handler */
export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.originalUrl}`));
};