"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the 'tasks' table with the 'last_updated_at' column
    await queryInterface.createTable("tasks", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      platform: {
        type: Sequelize.ENUM("instagram", "youtube"),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("like", "follow", "view", "subscribe"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "processing", "completed", "failed"),
        defaultValue: "pending",
        allowNull: false,
      },
      last_updated_at: {
        // Ensure this column exists
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add an index for platform and type columns
    await queryInterface.addIndex("tasks", ["platform", "type"], {
      name: "tasks_platform_type",
    });

    // Add an index for the 'status' column
    await queryInterface.addIndex("tasks", ["status"], {
      name: "tasks_status",
    });

    // Add an index for the 'last_updated_at' column
    await queryInterface.addIndex("tasks", ["last_updated_at"], {
      name: "tasks_last_updated_at",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign key constraints before dropping the table
    await queryInterface
      .removeConstraint(
        "instagram_followed_accounts",
        "instagram_followed_accounts_ibfk_2"
      )
      .catch(() => {});
    await queryInterface
      .removeConstraint("task_executions", "task_executions_ibfk_2")
      .catch(() => {});

    // Drop the tasks table
    await queryInterface.dropTable("tasks");
  },
};
