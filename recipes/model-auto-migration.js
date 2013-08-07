var async = require('async');
var ds = require('../data-sources/db')('oracle');
var Customer = require('../models/customer');

var i = 1;

var customers = [
    {
        "email": "foo@bar.com",
        "username": "foo",
        "password": "123456"
    },
    {
        "email": "bar@bar.com",
        "username": "bar",
        "password": "123456"
    },
    {
        "email": "bat@bar.com",
        "username": "bat",
        "password": "123456"
    },
    {
        "email": "baz@bar.com",
        "username": "baz",
        "password": "123456"
    }
];


function createCustomers(cb) {
    var createTasks = [];

    customers.forEach(function (obj) {
        obj.id = ++i;
        createTasks.push(Customer.create.bind(Customer, obj));
    });

    async.parallel(createTasks, cb);
}

var task1 = function (cb) {
    ds.automigrate(function () {
        createCustomers(cb);
    });
};


var task2 = function (cb) {

    ds.autoupdate(function () {
        Customer.destroyAll(function (err) {
            if (err) {
                console.error('Could not destroy customers.');
                throw err;
            }
            createCustomers(cb);
        });

    });
};

async.series([task1, task2], function (err, results) {
    console.log(err, results);
});
