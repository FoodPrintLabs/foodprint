'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'user_identifier_image_url', {
      type: Sequelize.STRING,
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('user', 'user_identifier_image_url');
  }
};
