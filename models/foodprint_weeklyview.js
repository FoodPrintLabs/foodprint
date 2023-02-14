const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'FoodprintWeeklyview',
    {
      pk: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      logid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_logid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_supplierShortcode: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_supplierName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_farmerName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_supplierAddress: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_produceName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_photoHash: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
      harvest_TimeStamp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      harvest_CaptureTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      harvest_Description: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      harvest_geolocation: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_quantity: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_unitOfMeasure: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_description_json: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      harvest_BlockchainHashID: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_BlockchainHashData: {
        type: DataTypes.STRING(2000),
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
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      market_storageCaptureTime: {
        type: DataTypes.STRING(255),
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
        type: DataTypes.STRING(255),
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
      harvest_bool_added_to_blockchain: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_added_to_blockchain_date: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_added_to_blockchain_by: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_blockchain_uuid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_user: {
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
      year_established: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      covid19_response: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'foodprint_weeklyview',
      timestamps: false,
      indexes: [
        {
          name: 'foodprint_weeklyview_PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'pk' }],
        },
      ],
    }
  );
};
