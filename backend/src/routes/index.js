import express from "express";
import { authRouter } from "./auth.js";
import { orderRouter } from "./order.js";
import { balanceRouter } from "./balance.js";
import { instagramAccountRouter } from "./instagram-account.js";
import { userRouter } from "./user.js";
import { taskRouter } from "./tasks.js";
import { adminRouter } from "./admin/index.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.use("/auth", authRouter);

// Protected routes (require authentication)
router.use(auth);
router.use("/orders", orderRouter);
router.use("/balance", balanceRouter);
router.use("/instagram-accounts", instagramAccountRouter);
router.use("/user", userRouter);
router.use("/tasks", taskRouter);

// Admin routes (require authentication and admin role)
router.use("/admin", adminRouter);

export { router as apiRouter };