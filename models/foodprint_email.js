const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'foodprintemail',
    {
      pk: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      email_logid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email_recipient: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email_subject: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email_timestamp: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email_content: {
        type: DataTypes.STRING(2000),
        allowNull: true,
      },
      email_status: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'foodprint_email',
      timestamps: false,
      indexes: [
        {
          name: 'foodprint_email_PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'pk' }],
        },
      ],
    }
  );
};
