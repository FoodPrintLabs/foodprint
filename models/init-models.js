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
var _Buyer_bid = require('./buyer_bid');
var _Seller_offer = require('./seller_offer');
var _My_orders = require('./my_orders');
var _User = require('./user');
var _FoodprintEmail = require('./foodprint_email');
var _FoodprintQRCode = require('./foodprint_qrcode');
var _FoodprintQRCodeProductAttributes = require('./foodprint_qrcode_product_attributes');

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
  var Buyer_bid = _Buyer_bid(sequelize, DataTypes);
  var Seller_offer = _Seller_offer(sequelize, DataTypes);
  var My_orders = _My_orders(sequelize, DataTypes);
  var User = _User(sequelize, DataTypes);
  var FoodprintEmail = _FoodprintEmail(sequelize, DataTypes);
  var FoodprintQRCode = _FoodprintQRCode(sequelize, DataTypes);
  var FoodprintQRCodeProductAttributes = _FoodprintQRCodeProductAttributes(sequelize, DataTypes);

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
    Buyer_bid,
    Seller_offer,
    My_orders,
    FoodprintEmail,
    FoodprintQRCode,
    FoodprintQRCodeProductAttributes,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
