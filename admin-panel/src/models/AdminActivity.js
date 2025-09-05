import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Admin from './Admin.js';

const AdminActivity = sequelize.define('AdminActivity', {
  id: {
    type: DataTypes.STRING,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'admin_id'
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resourceId: {
    type: DataTypes.STRING,
    field: 'resource_id'
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.STRING,
    field: 'user_agent'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  }
}, {
  tableName: 'admin_activities',
  timestamps: true,
  underscored: true
});

// Associations
AdminActivity.belongsTo(Admin, { foreignKey: 'adminId' });
Admin.hasMany(AdminActivity, { foreignKey: 'adminId' });

export default AdminActivity;