var DataTypes = require("sequelize").DataTypes;
var _FoodprintHarvest = require("./foodprint_harvest");
var _FoodprintQrcount = require("./foodprint_qrcount");
var _FoodprintStorage = require("./foodprint_storage");
var _FoodprintSubscription = require("./foodprint_subscription");
var _FoodprintWeeklyview = require("./foodprint_weeklyview");

function initModels(sequelize) {
  var FoodprintHarvest = _FoodprintHarvest(sequelize, DataTypes);
  var FoodprintQrcount = _FoodprintQrcount(sequelize, DataTypes);
  var FoodprintStorage = _FoodprintStorage(sequelize, DataTypes);
  var FoodprintSubscription = _FoodprintSubscription(sequelize, DataTypes);
  var FoodprintWeeklyview = _FoodprintWeeklyview(sequelize, DataTypes);


  return {
    FoodprintHarvest,
    FoodprintQrcount,
    FoodprintStorage,
    FoodprintSubscription,
    FoodprintWeeklyview,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
