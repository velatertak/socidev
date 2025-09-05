import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

const Task = sequelize.define(
  "Task",
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
    type: {
      type: DataTypes.ENUM("like", "follow", "view", "subscribe"),
      allowNull: false,
    },
    platform: {
      type: DataTypes.ENUM("instagram", "youtube"),
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
    remainingQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "remaining_quantity",
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
      defaultValue: "pending",
    },
    lastUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "last_updated_at",
    },
  },
  {
    tableName: "tasks",
    underscored: true,
    indexes: [
      {
        fields: ["platform", "type"],
        name: "tasks_platform_type",
      },
      {
        fields: ["status"],
        name: "tasks_status",
      },
      {
        fields: ["last_updated_at"],
        name: "tasks_last_updated_at",
      },
    ],
  }
);

Task.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Task, { foreignKey: "userId" });

export default Task;
