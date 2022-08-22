const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'FoodprintQRcodeProductAttributes',
    {
      pk: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      qrcode_logid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      attribute_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      product_attribute: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      product_attribute_description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_hashid: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'foodprint_qrcode_product_attributes',
      timestamps: false,
      indexes: [
        {
          name: 'foodprint_qrcode_PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'pk' }],
        },
      ],
    }
  );
};
