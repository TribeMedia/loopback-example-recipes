/**
 * This example demonstrates how to build a loopback data model from a JSON document
 */
var ds = require('../data-sources/db.js')('memory');

// Instance JSON document
var user = {
    name: 'Joe',
    age: 30,
    birthday: new Date(),
    vip: true,
    address: {
        street: '1 Main St',
        city: 'San Jose',
        state: 'CA',
        zipcode: '95131',
        country: 'US'
    },
    friends: ['John', 'Mary'],
    emails: [
        {label: 'work', id: 'x@sample.com'},
        {label: 'home', id: 'x@home.com'}
    ],
    tags: []
};

// Create a model from the user instance
var User = ds.buildModelFromInstance('User', user, {idInjection: true});

// Use the model for CRUD
var obj = new User(user);

console.log(obj.toObject());

User.create(user, function (err, u1) {
    console.log('Created: ', u1.toObject());
    User.findById(u1.id, function (err, u2) {
        console.log('Found: ', u2.toObject());
    });
});


