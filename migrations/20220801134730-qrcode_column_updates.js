'use strict';
/*
$npx sequelize-cli migration:create --name qrcode_column_updates
$npm run build-dev will run this sequelize db:migrate --env development
$sequelize db:migrate:undo --env development will revert most the recent migration
$sequelize db:migrate:undo:all will undo all migrations
*/
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
      await queryInterface.addColumn('foodprint_qrcode', 'qrcode_hashid', {
        type: Sequelize.STRING,
      })
     )
      .then(
        await queryInterface.addColumn('foodprint_qrcode', 'qrcode_company_logo_url', {
          type: Sequelize.STRING,
        })
      )
      .then(
        await queryInterface.addColumn('foodprint_qrcode_product_attributes', 'qrcode_hashid', {
          type: Sequelize.STRING,
          allowNull: false,
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
        await queryInterface.removeColumn('foodprint_qrcode', 'qrcode_hashid')
      )
      .then(
        await queryInterface.removeColumn('foodprint_qrcode', 'qrcode_company_logo_url'))
      .then(
        await queryInterface.removeColumn('foodprint_qrcode_product_attributes', 'qrcode_hashid')
      );
  },
};
