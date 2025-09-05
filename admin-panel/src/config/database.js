import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.MAIN_DB_NAME || 'social_developer',
  process.env.MAIN_DB_USER || 'root',
  process.env.MAIN_DB_PASS || '',
  {
    host: process.env.MAIN_DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

export default sequelize;