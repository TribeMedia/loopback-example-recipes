var ds = require('../data-sources/db.js')('mongodb');

var Customer = ds.createModel('customer', {
    id: {type: Number, id: true},
    name: String,
    emails: [String],
    age: Number});

Customer.create({
    name: 'John1',
    emails: ['john@x.com', 'jhon@y.com'],
    age: 30
}, function (err, customer) {
    console.log(customer.toObject());
    Customer.create({
        name: 'John2',
        emails: ['john@x.com', 'jhon@y.com'],
        age: 30
    }, function (err, customer) {
        console.log(customer.toObject());
        ds.disconnect();
    });

});

