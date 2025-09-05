import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Withdrawal = sequelize.define('Withdrawal', {
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  method: {
    type: DataTypes.ENUM('bank_transfer', 'crypto'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  details: {
    type: DataTypes.JSON,
    allowNull: false
  },
  processedAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'withdrawals',
  underscored: true
});

Withdrawal.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Withdrawal, { foreignKey: 'userId' });

export default Withdrawal;