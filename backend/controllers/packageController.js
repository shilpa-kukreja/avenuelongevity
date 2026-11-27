import { Package } from "../models/Package.js";

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
// packageController.js
export const getPackages = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const packages = await Package.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }
    res.status(200).json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a package
// @route   POST /api/packages
// @access  Private/Admin
export const createPackage = async (req, res) => {
  try {
    const newPackage = await Package.create(req.body);
    res.status(201).json({ success: true, package: newPackage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a package
// @route   PUT /api/packages/:id
// @access  Private/Admin
export const updatePackage = async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, package: updatedPackage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a package
// @route   DELETE /api/packages/:id
// @access  Private/Admin
export const deletePackage = async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Package deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};