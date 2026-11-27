// routes/transactionRoutes.js
import express from "express";
import {
  createTransactionOrder,
  verifyTransactionAndSave,
  getMyTransactions,
  getAllTransactions,
} from "../controllers/transactionController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const transactionRouter = express.Router();

transactionRouter.post("/order", protect, createTransactionOrder);
transactionRouter.post("/verify", protect, verifyTransactionAndSave);
transactionRouter.get("/my-transactions", protect, getMyTransactions);
transactionRouter.get("/", protect, admin, getAllTransactions);

export default transactionRouter;