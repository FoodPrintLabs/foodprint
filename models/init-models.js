var DataTypes = require('sequelize').DataTypes;
var _FoodprintConfig = require('./foodprint_config');
var _FoodprintHarvest = require('./foodprint_harvest');
var _FoodprintQrcount = require('./foodprint_qrcount');
var _FoodprintStorage = require('./foodprint_storage');
var _FoodprintSubscription = require('./foodprint_subscription');
var _FoodprintWeeklyview = require('./foodprint_weeklyview');
var _MarketSubscription = require('./market_subscription');
var _FoodprintProduce = require('./foodprint_produce');
var _FoodprintProducePrice = require('./foodprint_produce_price');
var _User = require('./user');

function initModels(sequelize) {
  var FoodprintConfig = _FoodprintConfig(sequelize, DataTypes);
  var FoodprintHarvest = _FoodprintHarvest(sequelize, DataTypes);
  var FoodprintQrcount = _FoodprintQrcount(sequelize, DataTypes);
  var FoodprintStorage = _FoodprintStorage(sequelize, DataTypes);
  var FoodprintSubscription = _FoodprintSubscription(sequelize, DataTypes);
  var FoodprintWeeklyview = _FoodprintWeeklyview(sequelize, DataTypes);
  var MarketSubscription = _MarketSubscription(sequelize, DataTypes);
  var FoodprintProduce = _FoodprintProduce(sequelize, DataTypes);
  var FoodprintProducePrice = _FoodprintProducePrice(sequelize, DataTypes);
  var User = _User(sequelize, DataTypes);

  return {
    FoodprintConfig,
    FoodprintHarvest,
    FoodprintQrcount,
    FoodprintStorage,
    FoodprintSubscription,
    FoodprintWeeklyview,
    MarketSubscription,
    User,
    FoodprintProduce,
    FoodprintProducePrice,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
