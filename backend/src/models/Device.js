import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Device = sequelize.define('Device', {
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
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('PC', 'Laptop', 'Mobile'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'busy'),
    defaultValue: 'offline'
  },
  lastActive: {
    type: DataTypes.DATE
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

Device.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Device, { foreignKey: 'userId' });

export default Device;