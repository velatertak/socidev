import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const SocialAccount = sequelize.define('SocialAccount', {
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
  platform: {
    type: DataTypes.ENUM('instagram', 'youtube'),
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  credentials: {
    type: DataTypes.JSON,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'limited'),
    defaultValue: 'active'
  },
  lastChecked: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'social_accounts',
  underscored: true
});

SocialAccount.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(SocialAccount, { foreignKey: 'userId' });

export default SocialAccount;