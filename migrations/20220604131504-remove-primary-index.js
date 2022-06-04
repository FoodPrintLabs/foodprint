'use strict';
/*
$npx sequelize-cli migration:create --name remove-primary-index
$npm run build-dev
*/

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // logic for transforming into the new state
    await queryInterface.removeIndex('foodprint_config', 'PRIMARY')
        .then(queryInterface.removeIndex('foodprint_harvest', 'PRIMARY'))
        .then(queryInterface.removeIndex('foodprint_produce', 'PRIMARY'))
        .then(queryInterface.removeIndex('foodprint_produce_price', 'PRIMARY'))
        .then(queryInterface.removeIndex('foodprint_qrcount', 'PRIMARY'))
        .then(queryInterface.removeIndex('foodprint_storage', 'PRIMARY'))
        .then(queryInterface.removeIndex('foodprint_subscription', 'PRIMARY'))
        .then(queryInterface.removeIndex('foodprint_weeklyview', 'PRIMARY'))
        .then(queryInterface.removeIndex('market_subscription', 'PRIMARY'))
        .then(queryInterface.removeIndex('user', 'PRIMARY'));
  },

  down: async (queryInterface, Sequelize) => {
    // logic for reverting the changes
    await queryInterface.addIndex('foodprint_config', 'PRIMARY')
        .then(queryInterface.addIndex('foodprint_harvest', 'PRIMARY'))
        .then(queryInterface.addIndex('foodprint_produce', 'PRIMARY'))
        .then(queryInterface.addIndex('foodprint_produce_price', 'PRIMARY'))
        .then(queryInterface.addIndex('foodprint_qrcount', 'PRIMARY'))
        .then(queryInterface.addIndex('foodprint_storage', 'PRIMARY'))
        .then(queryInterface.addIndex('foodprint_subscription', 'PRIMARY'))
        .then(queryInterface.addIndex('foodprint_weeklyview', 'PRIMARY'))
        .then(queryInterface.addIndex('market_subscription', 'PRIMARY'))
        .then(queryInterface.addIndex('user', 'PRIMARY'));
  }
};
