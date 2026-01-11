const Customer = require('./Customer');
const Rental = require('./Rental');
const Payment = require('./Payment'); // Importamos el nuevo modelo

// --- Asociaciones de Alquileres (Rentals) ---
Customer.hasMany(Rental, {
    foreignKey: 'customer_id'
});

Rental.belongsTo(Customer, {
    foreignKey: 'customer_id'
});

// --- Asociaciones de Pagos (Payments) ---
// Un cliente tiene muchos pagos registrados
Customer.hasMany(Payment, {
    foreignKey: 'customer_id'
});

// Cada pago pertenece a un único cliente
Payment.belongsTo(Customer, {
    foreignKey: 'customer_id'
});

// (Opcional) Relación entre Pago y Alquiler si la necesitas
Payment.belongsTo(Rental, {
    foreignKey: 'rental_id'
});

Rental.hasMany(Payment, {
    foreignKey: 'rental_id'
});

module.exports = {
    Customer,
    Rental,
    Payment // Exportamos Payment para usarlo en el controlador
};