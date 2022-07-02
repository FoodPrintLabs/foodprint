const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'Buyer_bid',
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
      bid_user: {
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
      bid_province: {
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
      bid_saleUser: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_description: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'buyer_bid',
      timestamps: false,
      indexes: [
        {
          name: 'buyer_bid_PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'pk' }],
        },
      ],
    }
  );
};
