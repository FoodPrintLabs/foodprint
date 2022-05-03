const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'FoodprintBids',
    {
      pk: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      bid_logid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_UserName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_UserID: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      Bid_TimeStamp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      bid_produceName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_quantity: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_unitOfMeasure: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_price: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_SaleTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      bid_SaleUserName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_SaleUserId: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_SalePrice: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_description_json: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'foodprint_bids',
      timestamps: false,
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'pk' }],
        },
      ],
    }
  );
};
