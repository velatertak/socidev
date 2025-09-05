import express from "express";
import { adminTaskRouter } from "./tasks.js";

const router = express.Router();

// Mount admin routes
router.use("/tasks", adminTaskRouter);

export { router as adminRouter };