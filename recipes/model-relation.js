var ds = require('../data-sources/db.js')('mongodb');

// A function to show error/result with a prefix message
function show(msg) {
    return function (err, result) {
        if (err) {
            console.error(err);
        } else {
            if (msg) {
                console.log(msg + ': ', result);
            } else {
                console.log(result);
            }
        }
    };
}

// Relation type 1: belongsTo
// The Order belongs to a customer

var Order = ds.createModel('Order', {
    customerId: String,
    orderDate: Date
});

var Customer = ds.createModel('Customer', {
    name: String
});

Order.belongsTo(Customer);

// Use the belongsTo relation
Customer.create({name: 'John'}, function (err, customer) {
    show('First customer', err, customer);
    Order.create({customerId: customer.id, orderDate: new Date()}, function (err, order) {
        order.customer(show('Customer for order ' + order.id));
        order.customer(true, show('Customer for order ' + order.id));

        Customer.create({name: 'Mary'}, function (err, customer2) {
            show('Second customer', err, customer2);
            order.customer(customer2); // Set the order.customer to be customer2
            order.customer(show('Customer for order ' + order.id));
        });
    });
});


// Relation type 2: hasMany
// The customer has many orders

Customer.hasMany(Order, {as: 'orders', foreignKey: 'customerId'});

// Use the hasMany relation
Customer.create({name: 'Ray'}, function (err, customer) {
    console.log('Third customer', customer);
    Order.create({customerId: customer.id, orderDate: new Date()}, function (err, order) {
        console.log('Order 1', order);
        customer.orders(show('Orders for customer ' + customer.id));
        customer.orders.create({orderDate: new Date()}, function (err, order) {
            console.log('Order 2', order);
            customer.orders.findById(order.id, show('Order found'));
            customer.orders.destroy(order.id, show());
        });
    });
});

// Relation type 3: hasMany through
// The physician has many patients through appointments
// The patient has many physicians through appointments

var Physician = ds.createModel('Physician', {
    id: {type: String, id: true},
    name: String
});

var Patient = ds.createModel('Patient', {
    id: {type: String, id: true},
    name: String
});

var Appointment = ds.createModel('Appointment', {
    physicianId: String,
    patientId: String,
    appointmentDate: Date
});

// Connect Appointment to Patient & Physician
Appointment.belongsTo(Patient);
Appointment.belongsTo(Physician);

// Now we can create many to many relation between Physician and Patient through Appointment
Physician.hasMany(Patient, {through: Appointment});
Patient.hasMany(Physician, {through: Appointment});

// Use the hasMany-through relation
Physician.create({name: 'Smith', id: 'ph1'}, function (err, physician) {
    show('Physician')(err, physician);
    Patient.create({name: 'Mary', id: 'pa1'}, function (err, patient) {
        show('Patient')(err, patient);
        Appointment.create({appointmentDate: new Date(), physicianId: physician.id, patientId: patient.id},
            function (err, appointment) {
                show('Appointment')(err, appointment);
                physician.patients(show('Patients for physician ' + physician.id));
                patient.physicians(show('Physicians for patient ' + patient.id));
            });
    });
});

// Relation type 4: hasAndBelongsToMany
// The assembly has and belongs to many parts
// The part has and belongs to many assemblies

var Assembly = ds.createModel('Assembly', {
    name: String
});

var Part = ds.createModel('Part', {
    partNumber: String
});

Assembly.hasAndBelongsToMany(Part);
Part.hasAndBelongsToMany(Assembly);

// Use the hasAndBelongsToMany relation
Assembly.create({name: 'car'}, function (err, assembly) {
    show('Assembly')(err, assembly);
    Part.create({partNumber: 'engine'}, function (err, part) {
        show('Part')(err, part);
        assembly.parts.add(part, function (err) {
            assembly.parts(show('Parts for assembly ' + assembly.id));
        });

    });
});

