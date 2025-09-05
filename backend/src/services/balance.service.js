import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import sequelize from "../config/database.js";

export class BalanceService {
  async createDeposit(userId, amount, method, details = {}) {
    const dbTransaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId, { transaction: dbTransaction });
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const depositTransaction = await Transaction.create(
        {
          userId,
          type: "deposit",
          amount,
          method,
          details,
          status: method === "balance" ? "completed" : "pending",
        },
        { transaction: dbTransaction }
      );

      if (method === "balance") {
        await user.increment("balance", {
          by: amount,
          transaction: dbTransaction,
        });
      }

      await dbTransaction.commit();
      return depositTransaction;
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  async createWithdrawal(userId, amount, method, details = {}) {
    const dbTransaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId, { transaction: dbTransaction });
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      if (user.balance < amount) {
        throw new ApiError(400, "Insufficient balance");
      }

      // Create withdrawal transaction with negative amount
      const withdrawalTransaction = await Transaction.create(
        {
          userId,
          type: "withdrawal",
          amount: -amount, // Store as negative to represent money leaving the account
          method,
          details,
          status: "pending",
        },
        { transaction: dbTransaction }
      );

      // Immediately deduct the amount from user's balance
      await user.decrement("balance", {
        by: amount,
        transaction: dbTransaction,
      });

      await dbTransaction.commit();
      return withdrawalTransaction;
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  async approveWithdrawal(transactionId) {
    const dbTransaction = await sequelize.transaction();

    try {
      const transaction = await Transaction.findByPk(transactionId, {
        transaction: dbTransaction,
      });
      if (!transaction) {
        throw new ApiError(404, "Transaction not found");
      }

      if (transaction.type !== "withdrawal") {
        throw new ApiError(400, "Invalid transaction type");
      }

      if (transaction.status !== "pending") {
        throw new ApiError(400, "Transaction already processed");
      }

      // Update transaction status
      await transaction.update(
        {
          status: "completed",
        },
        { transaction: dbTransaction }
      );

      await dbTransaction.commit();
      return transaction;
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  async rejectWithdrawal(transactionId) {
    const dbTransaction = await sequelize.transaction();

    try {
      const transaction = await Transaction.findByPk(transactionId, {
        include: [User],
        transaction: dbTransaction,
      });

      if (!transaction) {
        throw new ApiError(404, "Transaction not found");
      }

      if (transaction.type !== "withdrawal") {
        throw new ApiError(400, "Invalid transaction type");
      }

      if (transaction.status !== "pending") {
        throw new ApiError(400, "Transaction already processed");
      }

      // Refund the amount back to user's balance
      await transaction.User.increment("balance", {
        by: Math.abs(transaction.amount), // Convert negative amount back to positive
        transaction: dbTransaction,
      });

      // Update transaction status
      await transaction.update(
        {
          status: "rejected",
        },
        { transaction: dbTransaction }
      );

      await dbTransaction.commit();
      return transaction;
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  async getTransactions(userId, { type, status, page = 1, limit = 10 }) {
    const where = { userId };
    if (type) where.type = type;
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { rows: transactions, count } = await Transaction.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      transactions,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getBalance(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user.balance;
  }
}
