const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'FoodprintNotice',
        {
            pk: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            notice_title: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            notice_description: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            notice_province: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            notice_date: {
                type: DataTypes.DATE,
                allowNull: true,
            }
        },
        {
            sequelize,
            tableName: 'foodprint_notice',
            timestamps: false,
            indexes: [
                {
                    name: 'foodprint_notice_PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'pk' }],
                },
            ],
        }
    );
};
