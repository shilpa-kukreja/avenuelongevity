import express from "express";
import { createMessage, getAllMessages, updateMessageStatus } from "../controllers/messageController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createMessage);
router.get("/", protect, admin, getAllMessages);
router.put("/:id", protect, admin, updateMessageStatus);

export default router;