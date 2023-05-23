const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'FoodprintStorage',
    {
      pk: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      harvest_logid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_supplierShortcode: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      supplierproduce: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      storage_logid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      market_Shortcode: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      market_Name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      market_Address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      market_quantity: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      market_unitOfMeasure: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      market_storageTimeStamp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      market_storageCaptureTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      market_URL: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      storage_BlockchainHashID: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      storage_BlockchainHashData: {
        type: DataTypes.STRING(2000),
        allowNull: true,
      },
      storage_Description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      storage_bool_added_to_blockchain: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      storage_added_to_blockchain_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      storage_added_to_blockchain_by: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      storage_blockchain_uuid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      blockchain_explorer_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      storage_user: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      logdatetime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lastmodifieddatetime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      qrcode_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'foodprint_storage',
      timestamps: false,
      indexes: [
        {
          name: 'foodprint_storage_PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'pk' }],
        },
      ],
    }
  );
};
