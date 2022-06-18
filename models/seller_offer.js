const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'Seller_offer',
    {
      pk: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      offer_logid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      offer_user: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      offer_timeStamp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      offer_produceName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      offer_quantity: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      offer_unitOfMeasure: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      offer_price: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      offer_province: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      offer_status: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      offer_saleTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      offer_saleUser: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      offer_description: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'seller_offer',
      timestamps: false,
      indexes: [
        {
          name: 'seller_offer_PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'pk' }],
        },
      ],
    }
  );
};
