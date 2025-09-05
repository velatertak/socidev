import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";
import logger from "../config/logger.js";

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid phone number"),
  ],
  catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation Error", errors.array());
    }

    const { email, password, firstName, lastName, username, phone } = req.body;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ApiError(400, "User already exists");
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      username,
      phone,
      balance: 0,
      role: "user",
      userMode: "taskDoer",
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phone,
        balance: user.balance,
        createdAt: user.createdAt,
      },
    });
  })
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").exists().withMessage("Password is required"),
  ],
  catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation Error", errors.array());
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Login attempt failed for email: ${email}`);
      throw new ApiError(401, "Invalid credentials");
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      logger.warn(`Invalid password for email: ${email}`);
      throw new ApiError(401, "Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    logger.info(`User logged in successfully: ${user.id}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phone,
        balance: user.balance,
        createdAt: user.createdAt,
      },
    });
  })
);

// Validate token
router.get(
  "/validate",
  catchAsync(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "Invalid token");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phone,
        balance: user.balance,
        createdAt: user.createdAt,
      },
    });
  })
);

export { router as authRouter };
