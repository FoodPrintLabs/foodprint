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
      .addColumn('foodprint_qrcount', 'qrtype', {
        type: Sequelize.STRING,
      })

      .then(
        await queryInterface.addColumn('foodprint_qrcount', 'qrlogid', {
          type: Sequelize.STRING,
        })
      )
      .then(
        await queryInterface.addColumn('foodprint_qrcount', 'user_email', {
          type: Sequelize.STRING,
        })
      )
      .then(
        await queryInterface.addColumn('foodprint_qrcount', 'location', {
          type: Sequelize.STRING,
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
      .removeColumn('foodprint_qrcount', 'qrtype')
      .then(await queryInterface.removeColumn('foodprint_qrcount', 'qrlogid'))
      .then(await queryInterface.removeColumn('foodprint_qrcount', 'user_email'))
      .then(await queryInterface.removeColumn('foodprint_qrcount', 'location'));
  },
};
