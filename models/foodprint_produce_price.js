const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'FoodprintProducePrice',
    {
      pk: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      produce_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      produce_price: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      produce_date: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      produce_province: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'foodprint_produce_price',
      timestamps: false,
      indexes: [
        {
          name: 'foodprint_produce_price_PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'pk' }],
        },
      ],
    }
  );
};
