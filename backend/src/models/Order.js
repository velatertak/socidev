import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      field: "user_id",
    },
    platform: {
      type: DataTypes.ENUM("instagram", "youtube"),
      allowNull: false,
    },
    service: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "target_url",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "start_count",
    },
    remainingCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "remaining_count",
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
      defaultValue: "pending",
    },
    speed: {
      type: DataTypes.ENUM("normal", "fast", "express"),
      defaultValue: "normal",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "orders",
    underscored: true,
  }
);

Order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });

export default Order;
