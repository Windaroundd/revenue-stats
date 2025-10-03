import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AdminModel } from "../models/Admin";
import { generateToken } from "../utils/jwt";
import type { AuthRequest } from "../middleware/auth";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, name, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      res.status(409).json({ error: "Admin already exists with this email" });
      return;
    }

    // Create new admin
    const admin = new AdminModel({
      email,
      password,
      name,
      role: role || "admin",
    });

    await admin.save();

    // Generate token
    const token = generateToken({
      adminId: String(admin._id),
      email: admin.email,
      role: admin.role,
    });

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Find admin
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check if admin is active
    if (!admin.isActive) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate token
    const token = generateToken({
      adminId: String(admin._id),
      email: admin.email,
      role: admin.role,
    });

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during login" });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const admin = await AdminModel.findById(req.admin.adminId).select(
      "-password"
    );

    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    res.json({
      admin: {
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching profile" });
  }
};
