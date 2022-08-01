const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'FoodprintQrcode',
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
      qrcode_company_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_company_founded: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_contact_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_website: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_facebook: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_twitter: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_instagram: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_company_logo_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_product_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_product_description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_hashid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_supplier_product: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      user_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrcode_logdatetime: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'foodprint_qrcode',
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
