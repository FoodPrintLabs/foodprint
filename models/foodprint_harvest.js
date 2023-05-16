const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'FoodprintHarvest',
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
      harvest_bool_added_to_blockchain: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_added_to_blockchain_date: {
        type: DataTypes.DATE,
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
      blockchain_explorer_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      harvest_user: {
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
    twilio_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
        channel: {
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
      tableName: 'foodprint_harvest',
      timestamps: false,
      indexes: [
        {
          name: 'foodprint_harvest_PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'pk' }],
        },
      ],
    }
  );
};
