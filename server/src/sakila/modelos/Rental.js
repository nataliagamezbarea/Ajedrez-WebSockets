// src/sakila/modelos/Rental.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../compartido/db_orm');

const Rental = sequelize.define('Rental', {
    rental_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true,
        field: 'rental_id' // Mapeo explícito
    },
    rental_date: { 
        type: DataTypes.DATE, 
        allowNull: false,
        field: 'rental_date'
    },
    inventory_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        field: 'inventory_id'
    },
    customer_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        field: 'customer_id'
    },
    return_date: { 
        type: DataTypes.DATE,
        field: 'return_date'
    },
    staff_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        field: 'staff_id'
    },
    last_update: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW,
        field: 'last_update'
    }
}, { 
    tableName: 'rental', 
    timestamps: false 
});

module.exports = Rental;