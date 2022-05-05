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
      bid_userName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_userID: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_timeStamp: {
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
      bid_status: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_saleTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      bid_saleUserName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_saleUserId: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_salePrice: {
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
