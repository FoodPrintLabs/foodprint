'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface
      .addColumn('foodprint_qrcode', 'qrcode_supplier_product', {
        type: Sequelize.STRING,
      })

      .then(
        await queryInterface.changeColumn('foodprint_qrcode', 'qrcode_hashid', {
          type: Sequelize.STRING,
          allowNull: true,
        })
      )
      .then(
        await queryInterface.addColumn('foodprint_qrcode', 'qrcode_company_logo_url', {
          type: Sequelize.STRING,
        })
      )
      .then(
        await queryInterface.changeColumn('foodprint_qrcode_product_attributes', 'qrcode_hashid', {
          type: Sequelize.STRING,
          allowNull: true,
        })
      );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface
      .removeColumn('foodprint_qrcode', 'qrcode_supplier_product')
      .then(
        await queryInterface.changeColumn('foodprint_qrcode', 'qrcode_hashid', {
          type: Sequelize.BLOB,
          allowNull: true,
        })
      )
      .then(await queryInterface.removeColumn('foodprint_qrcode', 'qrcode_company_logo_url'))
      .then(
        await queryInterface.changeColumn('foodprint_qrcode_product_attributes', 'qrcode_hashid', {
          type: Sequelize.BLOB,
          allowNull: true,
        })
      );
  },
};
