'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('foodprint_storage', 'blockchain_explorer_url', {
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('foodprint_storage', 'blockchain_explorer_url');
  },
};
