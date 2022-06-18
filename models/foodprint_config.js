const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'FoodprintConfig',
    {
      pk: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      configid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      configname: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      configdescription: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      configvalue: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      logdatetime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'foodprint_config',
      timestamps: false,
      indexes: [
        {
          name: 'foodprint_config_PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'pk' }],
        },
      ],
    }
  );
};
