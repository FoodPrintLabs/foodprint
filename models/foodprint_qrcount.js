const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'FoodprintQrcount',
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
      qrid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrurl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      marketid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      request_host: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      request_origin: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      request_useragent: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      logdatetime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      qrtype: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qrlogid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      user_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'foodprint_qrcount',
      timestamps: false,
      indexes: [
        {
          name: 'foodprint_qrcount_PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'pk' }],
        },
      ],
    }
  );
};
