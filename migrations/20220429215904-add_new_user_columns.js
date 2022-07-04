'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('user', 'userId', {
      type: Sequelize.STRING(255),
    });
    await queryInterface.addColumn('user', 'user_uuid', {
      type: Sequelize.STRING(255),
    });
    await queryInterface.addColumn('user', 'isAdminVerified', {
      type: Sequelize.BOOLEAN,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('user', 'userId');
    await queryInterface.removeColumn('user', 'user_uuid');
    await queryInterface.removeColumn('user', 'isAdminVerified');
  },
};
