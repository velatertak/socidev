import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Admin from './Admin.js';

const AdminSession = sequelize.define('AdminSession', {
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
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
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
  tableName: 'admin_sessions',
  timestamps: true,
  underscored: true
});

// Associations
AdminSession.belongsTo(Admin, { foreignKey: 'adminId' });
Admin.hasMany(AdminSession, { foreignKey: 'adminId' });

export default AdminSession;