import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Order from './Order.js';

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    field: 'user_id'
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Order,
      key: 'id'
    },
    field: 'order_id'
  },
  platform: {
    type: DataTypes.ENUM('YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'FACEBOOK'),
    allowNull: false
  },
  serviceType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'service_type'
  },
  targetUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'target_url'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reward: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'in_progress', 'completed', 'approved', 'rejected'),
    defaultValue: 'available'
  },
  proof: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  underscored: true
});

Task.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Task, { foreignKey: 'userId' });

Task.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(Task, { foreignKey: 'orderId' });

export default Task;