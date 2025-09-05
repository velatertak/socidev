const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "social_developer",
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    define: {
      timestamps: true,
      underscored: true,
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "social_developer_test",
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
  },
};
