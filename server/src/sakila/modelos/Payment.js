const { DataTypes } = require('sequelize');
const sequelize = require('../../compartido/db_orm');

const Payment = sequelize.define('Payment', {
    payment_id: {
        type: DataTypes.SMALLINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        field: 'payment_id'
    },
    customer_id: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
        field: 'customer_id'
    },
    staff_id: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        field: 'staff_id'
    },
    rental_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'rental_id'
    },
    amount: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        field: 'amount'
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'payment_date'
    },
    last_update: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'last_update'
    }
}, {
    tableName: 'payment',
    timestamps: false
});

module.exports = Payment;