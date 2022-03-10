const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'User',
    {
      ID: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      middleName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: 'email',
      },
      phoneNumber: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: 'phoneNumber',
      },
      role: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      registrationChannel: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nationalIdPhotoHash: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'user',
      timestamps: false,
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'ID' }],
        },
        {
          name: 'email',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'email' }],
        },
        {
          name: 'phoneNumber',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'phoneNumber' }],
        },
      ],
    }
  );
};
