var DataTypes = require("sequelize").DataTypes;
var _FoodprintHarvest = require("./foodprint_harvest");
var _FoodprintQrcount = require("./foodprint_qrcount");
var _FoodprintSubscription = require("./foodprint_subscription");

function initModels(sequelize) {
  var FoodprintHarvest = _FoodprintHarvest(sequelize, DataTypes);
  var FoodprintQrcount = _FoodprintQrcount(sequelize, DataTypes);
  var FoodprintSubscription = _FoodprintSubscription(sequelize, DataTypes);


  return {
    FoodprintHarvest,
    FoodprintQrcount,
    FoodprintSubscription,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
