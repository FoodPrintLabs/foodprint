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
    await queryInterface.addColumn('user', 'farmName', {
      type: Sequelize.STRING(255),
    });
    await queryInterface.addColumn('user', 'organisationName', {
      type: Sequelize.STRING(255),
    });
    await queryInterface.addColumn('user', 'organisationType', {
      type: Sequelize.STRING(255),
    });
    await queryInterface.addColumn('user', 'city', {
      type: Sequelize.STRING(255),
    });
    await queryInterface.addColumn('user', 'emailVerificationToken', {
      type: Sequelize.STRING(255),
    });
    await queryInterface.addColumn('user', 'isEmailVerified', {
      type: Sequelize.BOOLEAN,
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
    await queryInterface.removeColumn('user', 'farmName');
    await queryInterface.removeColumn('user', 'organisationName');
    await queryInterface.removeColumn('user', 'organisationType');
    await queryInterface.removeColumn('user', 'city');
    await queryInterface.removeColumn('user', 'emailVerificationToken');
    await queryInterface.removeColumn('user', 'isEmailVerified');
    await queryInterface.removeColumn('user', 'isAdminVerified');
  },
};
