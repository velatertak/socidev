import { TaskService } from "../../services/task.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { ApiError } from "../../utils/ApiError.js";
import Task from "../../models/Task.js";
import { Op } from "sequelize";

const taskService = new TaskService();

export class AdminTaskController {
  // Get all tasks with filtering and pagination
  getAllTasks = catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      search,
      platform,
      type,
      adminStatus,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const where = {};

    // Add search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { targetUrl: { [Op.like]: `%${search}%` } },
      ];
    }

    // Add platform filter
    if (platform && platform !== "ALL") {
      where.platform = platform;
    }

    // Add type filter
    if (type && type !== "ALL") {
      where.type = type;
    }

    // Add admin status filter
    if (adminStatus && adminStatus !== "all") {
      where.adminStatus = adminStatus;
    }

    const order = [[sortBy, sortOrder.toUpperCase()]];
    
    const tasks = await Task.findAndCountAll({
      where,
      include: [
        {
          model: require("../../models/User.js").default,
          attributes: ["id", "firstName", "lastName", "email", "username"],
        },
      ],
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      tasks: tasks.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: tasks.count,
        totalPages: Math.ceil(tasks.count / parseInt(limit)),
      },
    });
  });

  // Get pending tasks for approval
  getPendingTasks = catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      search,
      platform,
    } = req.query;

    const where = {
      adminStatus: "pending",
    };

    // Add search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { targetUrl: { [Op.like]: `%${search}%` } },
      ];
    }

    // Add platform filter
    if (platform && platform !== "ALL") {
      where.platform = platform;
    }

    const order = [["createdAt", "DESC"]];
    
    const tasks = await Task.findAndCountAll({
      where,
      include: [
        {
          model: require("../../models/User.js").default,
          attributes: ["id", "firstName", "lastName", "email", "username"],
        },
      ],
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      tasks: tasks.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: tasks.count,
        totalPages: Math.ceil(tasks.count / parseInt(limit)),
      },
    });
  });

  // Approve task
  approveTask = catchAsync(async (req, res) => {
    const taskId = req.params.id;
    const { notes } = req.body;

    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // Update task status
    await task.update({
      adminStatus: "approved",
      adminReviewedBy: req.user.id,
      adminReviewedAt: new Date(),
      status: "active", // Make task active so it can be executed
    });

    res.json({
      task,
    });
  });

  // Reject task
  rejectTask = catchAsync(async (req, res) => {
    const taskId = req.params.id;
    const { reason, notes } = req.body;

    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // Update task status
    await task.update({
      adminStatus: "rejected",
      adminReviewedBy: req.user.id,
      adminReviewedAt: new Date(),
      rejectionReason: reason,
      status: "rejected", // Mark task as rejected
    });

    res.json({
      task,
    });
  });

  // Get task details
  getTaskDetails = catchAsync(async (req, res) => {
    const taskId = req.params.id;

    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: require("../../models/User.js").default,
          attributes: ["id", "firstName", "lastName", "email", "username"],
        },
      ],
    });

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    res.json({
      task,
    });
  });
}