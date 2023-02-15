'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('foodprint_weeklyview', 'harvest_image_url', {
      type: Sequelize.STRING,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('foodprint_weeklyview', 'harvest_image_url');
  }
};
