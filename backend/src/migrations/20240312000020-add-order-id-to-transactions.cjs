"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // order_id sütununu ekleyelim
    await queryInterface.addColumn("transactions", "order_id", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Foreign key ekleyelim
    await queryInterface.addConstraint("transactions", {
      fields: ["order_id"],
      type: "foreign key",
      name: "transactions_order_id_fk",
      references: {
        table: "orders",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Index ekleyelim
    await queryInterface.addIndex("transactions", ["order_id"], {
      name: "transactions_order_id",
    });
  },

  async down(queryInterface, Sequelize) {
    // Önce foreign key constraint'ini kaldır
    await queryInterface.removeConstraint(
      "transactions",
      "transactions_order_id_fk"
    );

    // Sonra indexi kaldır
    await queryInterface.removeIndex("transactions", "transactions_order_id");

    // En son sütunu kaldır
    await queryInterface.removeColumn("transactions", "order_id");
  },
};
