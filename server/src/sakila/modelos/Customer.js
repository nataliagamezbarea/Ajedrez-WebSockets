const { DataTypes } = require('sequelize');
const sequelize = require('../../compartido/db_orm');

const Customer = sequelize.define('Customer', {
    customer_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true,
        field: 'customer_id'
    },
    store_id: {
        type: DataTypes.INTEGER,
        field: 'store_id'
    },
    first_name: { 
        type: DataTypes.STRING, 
        allowNull: false,
        field: 'first_name' 
    },
    last_name: { 
        type: DataTypes.STRING, 
        allowNull: false,
        field: 'last_name' 
    },
    email: {
        type: DataTypes.STRING,
        field: 'email'
    },
    address_id: {
        type: DataTypes.INTEGER,
        field: 'address_id'
    },
    active: {
        type: DataTypes.BOOLEAN,
        field: 'active'
    },
    create_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'create_date'
    },
    last_update: {
        type: DataTypes.DATE,
        field: 'last_update'
    }
}, { 
    tableName: 'customer', 
    timestamps: false 
});

module.exports = Customer;