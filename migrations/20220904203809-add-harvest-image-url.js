'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('foodprint_harvest', 'harvest_image_url', {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('foodprint_harvest', 'harvest_image_url');
  },
};
