"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranch = exports.updateBranch = exports.getBranchById = exports.getBranches = exports.createBranch = void 0;
const branch_js_1 = require("../models/branch.js");
const shared_1 = require("shared");
const createBranch = async (req, res, next) => {
    try {
        const { name, address, city, phone, coords } = req.body;
        if (!name || !address || !city || !phone || !coords) {
            throw new shared_1.BadRequestError('Name, address, city, phone, and coords are required');
        }
        const branch = new branch_js_1.Branch({
            name,
            address,
            city,
            phone,
            coords,
        });
        await branch.save();
        res.status(201).json({
            success: true,
            message: 'Branch created successfully',
            data: branch,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createBranch = createBranch;
const getBranches = async (req, res, next) => {
    try {
        const branches = await branch_js_1.Branch.find({ isActive: true });
        res.json({
            success: true,
            data: branches,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getBranches = getBranches;
const getBranchById = async (req, res, next) => {
    try {
        const branch = await branch_js_1.Branch.findById(req.params.id);
        if (!branch) {
            throw new shared_1.NotFoundError('Branch not found');
        }
        res.json({
            success: true,
            data: branch,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getBranchById = getBranchById;
const updateBranch = async (req, res, next) => {
    try {
        const branch = await branch_js_1.Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!branch) {
            throw new shared_1.NotFoundError('Branch not found');
        }
        res.json({
            success: true,
            message: 'Branch updated successfully',
            data: branch,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateBranch = updateBranch;
const deleteBranch = async (req, res, next) => {
    try {
        const branch = await branch_js_1.Branch.findByIdAndDelete(req.params.id);
        if (!branch) {
            throw new shared_1.NotFoundError('Branch not found');
        }
        res.json({
            success: true,
            message: 'Branch deleted successfully',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteBranch = deleteBranch;
//# sourceMappingURL=branch-controller.js.map