// packageRoutes.js
import express from "express";
import { getPackages, createPackage, updatePackage, deletePackage ,getPackageById} from "../controllers/packageController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const PackageRouter = express.Router();
PackageRouter.route("/").get(getPackages).post(protect, admin, createPackage);
// packageRoutes.js
PackageRouter.route("/:id")
  .get(getPackageById)
  .put(protect, admin, updatePackage)
  .delete(protect, admin, deletePackage);

export default PackageRouter;

