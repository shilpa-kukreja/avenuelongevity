// membershipRoutes.js
import express from "express";
import { getMemberships, createMembership, updateMembership, deleteMembership,getMembershipById } from "../controllers/membershipController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const MembershipRouter = express.Router();
MembershipRouter.route("/").get(getMemberships).post(protect, admin, createMembership);
// membershipRoutes.js
MembershipRouter.route("/:id")
  .get(getMembershipById)
  .put(protect, admin, updateMembership)
  .delete(protect, admin, deleteMembership);

export default MembershipRouter;