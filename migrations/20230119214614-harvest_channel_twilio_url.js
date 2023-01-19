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
        .addColumn('foodprint_harvest', 'channel', {
          type: Sequelize.STRING,
        })

        .then(
            await queryInterface.addColumn('foodprint_harvest', 'twilio_url', {
              type: Sequelize.STRING,
            })
        )
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface
        .removeColumn('foodprint_harvest', 'channel')
        .then(await queryInterface.removeColumn('foodprint_harvest', 'twilio_url'))
  },
};
