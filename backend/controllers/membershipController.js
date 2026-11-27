import { Membership } from "../models/Package.js";

// @desc    Get all memberships
// @route   GET /api/memberships
// @access  Public
// membershipController.js
export const getMemberships = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const memberships = await Membership.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, memberships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMembershipById = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ success: false, message: "Membership not found" });
    }
    res.status(200).json({ success: true, membership });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a membership
// @route   POST /api/memberships
// @access  Private/Admin
export const createMembership = async (req, res) => {
  try {
    const newMembership = await Membership.create(req.body);
    res.status(201).json({ success: true, membership: newMembership });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a membership
// @route   PUT /api/memberships/:id
// @access  Private/Admin
export const updateMembership = async (req, res) => {
  try {
    const updated = await Membership.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, membership: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a membership
// @route   DELETE /api/memberships/:id
// @access  Private/Admin
export const deleteMembership = async (req, res) => {
  try {
    await Membership.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Membership deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};