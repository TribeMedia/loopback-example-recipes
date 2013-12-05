/**
 * This recipe demonstrates how to build a loopback data model from a JSON document
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
        {label: 'work', eid: 'x@sample.com'},
        {label: 'home', eid: 'x@home.com'}
    ],
    tags: []
};

// Create a model from the user instance
var User = ds.modelBuilder.buildModelFromInstance('MyUser', user, {idInjection: true});
User.attachTo(ds);

// Use the model for CRUD

User.create(user, function (err, u1) {
    console.log('Created: ', u1.toObject());
    User.findById(u1.id, function (err, u2) {
        console.log('Found: ', u2.toObject());
    });
});

