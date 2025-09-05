"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("social_accounts", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      platform: {
        type: Sequelize.ENUM("instagram", "youtube"),
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      credentials: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "limited"),
        defaultValue: "active",
      },
      last_checked: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      settings: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("social_accounts");
  },
};
