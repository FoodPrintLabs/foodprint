// node ./tests/sequelize.js

const { Op, Sequelize } = require('sequelize');

var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');

var models = initModels(sequelise);

// Find all harvests
// Raw SQL: SELECT harvest_logid', 'harvest_produceName' FROM foodprint_harvest;
const findAll = async () => {
  const harvests = await models.FoodprintHarvest.findAll({
    attributes: ['harvest_logid', 'harvest_produceName'],
  });
  console.log('All harvests:' + harvests.length.toString());
  console.log('All harvests:', JSON.stringify(harvests, null, 4));
};

const run = async () => {
  await findAll();
  await process.exit();
};

run();
