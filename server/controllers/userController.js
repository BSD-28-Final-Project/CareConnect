import { getUserCollection } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password validation (minimal 5 characters)
    if (password.length < 5) {
      return res.status(400).json({ message: "Password must be at least 5 characters long" });
    }

    const collection = await getUserCollection();

    // Check if user already exists
    const existing = await collection.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    const user = {
      name,
      email,
      password: hashed,
      role: role || "user",
      point: 0,
      totalDonations: 0,
      totalVolunteerActivities: 0,
      achievements: [],
      activityLog: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(user);
    
    res.status(201).json({ 
      message: "User registered successfully",
      userId: result.insertedId
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const collection = await getUserCollection();
    const user = await collection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate token
    const token = jwt.sign(
      { 
        _id: user._id.toString(), 
        email: user.email,
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );

    res.json({ 
      message: "Login successful", 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        point: user.point
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get user profile (own profile)
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id; // From JWT token
    const collection = await getUserCollection();
    
    const { ObjectId } = await import("mongodb");
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't send password in response
    const { password, ...userWithoutPassword } = user;

    res.json({
      message: "Profile retrieved successfully",
      user: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id; // From JWT token
    const { name, email, currentPassword, newPassword } = req.body;

    const collection = await getUserCollection();
    const { ObjectId } = await import("mongodb");
    
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      updatedAt: new Date()
    };

    // Update name if provided
    if (name) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ message: "Invalid name" });
      }
      updateData.name = name.trim();
    }

    // Update email if provided
    if (email) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Check if email already exists (for other users)
      const existingUser = await collection.findOne({ 
        email, 
        _id: { $ne: new ObjectId(userId) } 
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      updateData.email = email;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change password" });
      }

      // Verify current password
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Validate new password
      if (newPassword.length < 5) {
        return res.status(400).json({ message: "New password must be at least 5 characters long" });
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Perform update
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get updated user data
    const updatedUser = await collection.findOne({ _id: new ObjectId(userId) });
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      message: "Profile updated successfully",
      user: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
};

// Get user by ID (admin only or own profile)
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await getUserCollection();
    
    const { ObjectId } = await import("mongodb");
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await collection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check authorization: user can only see their own profile unless admin
    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Don't send password in response
    const { password, ...userWithoutPassword } = user;

    res.json({
      message: "User retrieved successfully",
      user: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
};
