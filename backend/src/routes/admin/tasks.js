import express from "express";
import { AdminTaskController } from "../../controllers/admin/task.controller.js";
import { auth } from "../../middleware/auth.js";
import { admin } from "../../middleware/admin.js";

const router = express.Router();
const adminTaskController = new AdminTaskController();

// All admin task routes require authentication and admin role
router.use(auth, admin);

// Get all tasks with filtering
router.get("/", adminTaskController.getAllTasks);

// Get pending tasks for approval
router.get("/pending", adminTaskController.getPendingTasks);

// Approve task
router.post("/:id/approve", adminTaskController.approveTask);

// Reject task
router.post("/:id/reject", adminTaskController.rejectTask);

// Get task details
router.get("/:id", adminTaskController.getTaskDetails);

export { router as adminTaskRouter };