const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'My_orders',
    {
      pk: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      order_logid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      order_original_logid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      order_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      offer_user: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bid_user: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      order_timeStamp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      order_original_timeStamp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      order_produceName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      order_quantity: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      order_price: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      order_province: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'my_orders',
      timestamps: false,
      indexes: [
        {
          name: 'my_order_PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'pk' }],
        },
      ],
    }
  );
};
