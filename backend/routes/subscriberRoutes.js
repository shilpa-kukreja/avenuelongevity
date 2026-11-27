import express from "express";
import { createSubscriber, getAllSubscribers, deleteSubscriber, updateSubscriberStatus } from "../controllers/subscriberController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const subscriberRouter = express.Router();

subscriberRouter.post("/", createSubscriber); // Changed to "/" for cleaner API
subscriberRouter.get("/", protect, admin, getAllSubscribers);
subscriberRouter.delete("/:id", protect, admin, deleteSubscriber);
subscriberRouter.put("/:id", protect, admin, updateSubscriberStatus);

export default subscriberRouter;