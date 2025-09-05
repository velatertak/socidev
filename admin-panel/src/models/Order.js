import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Order = sequelize.define('Order', {
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
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'start_count'
  },
  remainingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'remaining_count'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  speed: {
    type: DataTypes.STRING,
    defaultValue: 'normal'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminNotes: {
    type: DataTypes.TEXT,
    field: 'admin_notes'
  },
  approvedBy: {
    type: DataTypes.STRING,
    field: 'approved_by'
  },
  approvedAt: {
    type: DataTypes.DATE,
    field: 'approved_at'
  },
  rejectedBy: {
    type: DataTypes.STRING,
    field: 'rejected_by'
  },
  rejectedAt: {
    type: DataTypes.DATE,
    field: 'rejected_at'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    field: 'rejection_reason'
  },
  updatedBy: {
    type: DataTypes.STRING,
    field: 'updated_by'
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
  tableName: 'orders',
  timestamps: true,
  underscored: true
});

// Associations
Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });

export default Order;

export { Order };