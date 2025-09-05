import { BalanceService } from "../services/balance.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

const balanceService = new BalanceService();

export class BalanceController {
  // Add balance
  addBalance = catchAsync(async (req, res) => {
    const { amount, method, details } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      throw new ApiError(400, "Invalid amount");
    }

    const transaction = await balanceService.createDeposit(
      userId,
      amount,
      method,
      details
    );
    res.status(201).json(transaction);
  });

  // Withdraw balance
  withdrawBalance = catchAsync(async (req, res) => {
    const { amount, method, details } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      throw new ApiError(400, "Invalid amount");
    }

    const transaction = await balanceService.createWithdrawal(
      userId,
      amount,
      method,
      details
    );
    res.status(201).json(transaction);
  });

  // Get transactions
  getTransactions = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { type, status, page = 1, limit = 10 } = req.query;

    const transactions = await balanceService.getTransactions(userId, {
      type,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(transactions);
  });

  // Get balance
  getBalance = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const balance = await balanceService.getBalance(userId);
    res.json({ balance });
  });
}
