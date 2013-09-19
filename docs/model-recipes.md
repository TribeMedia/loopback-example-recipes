# Recipes for LoopBack Models

Rich mobile applications are driven by data. Data can be produced and consumed
everywhere, including mobile devices, browsers, databases, cloud services,
legacy applications, or whatever backend systems you have.

LoopBack is designed to mobilize data. The facilities are centered around models
which represent business data and behaviors. Models are exposed to mobile
applications through SDKs and/or REST APIs. Depending on where the data live and
how the data is defined. mobile developers often need different ways to interact
with models. In this series of blogs, I'll walk you through a list of recipes to
work with LoopBack models to support various use cases. It will cover:

- Open models
- Models with schema definitions
- Model discovery with relational databases
- Model synchronization with relational databases
- Models by instance introspection

Let's start with the simplest one.

## Part 1: Open models

> I'm mobile developer. Can LoopBack help me save and load data transparently?
I just don't have to worry about the backend or define the model properties
upfront as my data are free form.

LoopBack can get you started right the way.

    var loopback = require('loopback');
    var app = loopback(); // Create an instance of LoopBack

    // Create an in memory data source
    var ds = loopback.createDataSource('memory');

    // Create a open model that doesn't require predefined properties
    var FormModel = ds.createModel('form');

    // Expose the model as REST APIs
    app.model(FormModel);
    app.use(loopback.rest());

    // Listen on HTTP requests
    app.listen(3000, function () {
        console.log('The form application is ready at http://127.0.0.1:3000');

        console.log('\nTo try it out, run the following command:');
        console.log('curl -X POST -H "Content-Type:application/json" -d \'{"a": 1, "b": "B"}\' http://127.0.0.1:3000/forms');
    });


Please note that we only pass a name to the ds.createModel(). This will create
a model that allows any properties to be set on the model instances, i.e., an
open model.

To try it out, run the following command:

    curl -X POST -H "Content-Type:application/json" -d '{"a": 1, "b": "B"}' http://127.0.0.1:3000/forms

The output is a JSON object for the newly created instance.

    {
      "id": "52389f5f7d365dd52a000005",
      "a": 1,
      "b": "B"
    }

You can retrieve the instance by id:

    curl -X GET http://127.0.0.1:3000/forms/52389f5f7d365dd52a000005

**Note: Your id might be different. Please copy it from the POST response.**

To submit a different form:

    curl -X POST -H "Content-Type:application/json" -d '{"a": "A", "c": "C", "d": true}' http://localhost:3000/forms

Now you see the newly created instance as follows:

    {
      "id": "5238c1e492f7b69535000001",
      "a": "A",
      "c": "C",
      "d": true
    }

The open model is simple and flexible. It works well for free-form style data as
the model doesn't constrain the properties and their types. But for other
scenarios, a predefined model is preferred as it will validate the data and
make sure the data is exchangeable between multiple systems.

## Part 2: Models with schema definitions

> I want to build a mobile application which will interact with some backend
data. I would love to see a working REST API and mobile SDK before I implement
the server side logic.

In this case, we'll define a model first and use an in-memory data source to
mock up the data access. You'll get a fully-fledged REST API without writing
a lot of server side code.

    var loopback = require('loopback');

    var ds = loopback.createDataSource('memory');

    var Customer = ds.createModel('customer', {
        id: {type: Number, id: true},
        name: String,
        emails: [String],
        age: Number});

You can now test the CRUD operations on the server side:

    // Create two instances
    Customer.create({
        name: 'John1',
        emails: ['john@x.com', 'jhon@y.com'],
        age: 30
    }, function (err, customer1) {
        console.log('Customer 1: ', customer1.toObject());
        Customer.create({
            name: 'John2',
            emails: ['john@x.com', 'jhon@y.com'],
            age: 30
        }, function (err, customer2) {
            console.log('Customer 2: ', customer2.toObject());
            Customer.findById(customer2.id, function(err, customer3) {
                console.log(customer3.toObject());
            });
            Customer.find({where: {name: 'John1'}, limit: 3}, function(err, customers) {
                customers.forEach(function(c) {
                    console.log(c.toObject());
                });
            });
        });

    });

The code above creates two customers, find a customer by id, then find customers
by name to return up to 3 instances.

To expose the model as REST APIs:

    var app = loopback();
    app.model(Customer);
    app.use(loopback.rest());
    app.listen(3000, function() {
        console.log('The form application is ready at http://127.0.0.1:3000');
    });

Until now the data access is backed by an in-memory store. To make your data
persistent, you can simply replace it with a MongoDB database by changing the
data source configuration:

    var ds = loopback.createDataSource('mongodb', {
        "host": "demo.strongloop.com",
        "database": "demo",
        "username": "demo",
        "password": "L00pBack",
        "port": 27017
    });

Back to the model definition, do I always have to define the properties from
scratch? The good news is that LoopBack can discover model definitions from
existing systems such as relational databases or JSON documents.

## Part 3: Model Discovery with Relational Databases

> I already have data in databases such as Oracle. Can LoopBack figure out the
models and expose them as APIs to my mobile applications?

It's surprising simple to do so with LoopBack. The code first sets up the Oracle
data source and calls discoverAndBuildModels() to create models from the database
tables. Please note the 'association' option is set to true so that the discovery
follows primary/foreign key relations.

    var loopback = require('loopback');

    var ds = loopback.createDataSource('oracle', {
                "host": "demo.strongloop.com",
                "port": 1521,
                "database": "XE",
                "username": "demo",
                "password": "L00pBack"
            });

    /**
     * Discover and build models from INVENTORY table
     */
    ds.discoverAndBuildModels('INVENTORY', {visited: {}, associations: true},
        function (err, models) {

        // Now we have a list of models keyed by the model name
        // Find the first record from the inventory
        models.Inventory.findOne({}, function (err, inv) {
            if(err) {
                console.error(err);
                return;
            }
            console.log("\nInventory: ", inv);
            // Navigate to the product model
            inv.product(function (err, prod) {
                console.log("\nProduct: ", prod);
                console.log("\n ------------- ");
            });
        });
    });

Discovery from relational databases is a quick way to consume existing data that
have well-defined schemas. But it's not always possible though, for example,
MongoDB doesn't have schemas, nor does REST services. LoopBack has another option
here.


## Part 4: Model Synchronization with Relational Databases

> Now I have defined a LoopBack model, can LoopBack create or update the
database schemas for me?

LoopBack data source for relational databases provide two methods to synchronize
the model definitions with table schemas.

- automigrate: Automatically create or re-create the table schemas based on the
model definitions. **WARNING: Existing tables will be dropped if its name matches
the model name.**

- autoupdate: Automatically alter the table schemas based on the model definitions

Let's start with first version of the model definition:

    var schema_v1 =
    {
        "name": "CustomerTest",
        "options": {
            "idInjection": false,
            "oracle": {
                "schema": "LOOPBACK",
                "table": "CUSTOMER_TEST"
            }
        },
        "properties": {
            "id": {
                "type": "String",
                "length": 20,
                "id": 1
            },
            "name": {
                "type": "String",
                "required": false,
                "length": 40
            },
            "email": {
                "type": "String",
                "required": false,
                "length": 40
            },
            "age": {
                "type": "Number",
                "required": false
            }
        }
    };

Assuming the model doesn't have a corresponding table in the Oracle database,
LoopBack can create the corresponding schema objects on behave of the model
definition:

    var ds = require('../data-sources/db')('oracle');
    var Customer = require('../models/customer');

    ds.createModel(schema_v1.name, schema_v1.properties, schema_v1.options);

    ds.automigrate(function () {


        ds.discoverModelProperties('CUSTOMER_TEST', function (err, props) {
            console.log(props);

        });

    });

Please note that a few objects are created on Oracle side:
- A table CUSTOMER_TEST
- A sequence CUSTOMER_TEST_ID_SEQUENCE (for keeping sequential IDs)
- A trigger CUSTOMER_ID_TRIGGER (Setting IDs for the primary key)

Now we decide to make some changes to the model. Here is the second version:

    var schema_v2 =
    {
        "name": "CustomerTest",
        "options": {
            "idInjection": false,
            "oracle": {
                "schema": "LOOPBACK",
                "table": "CUSTOMER_TEST"
            }
        },
        "properties": {
            "id": {
                "type": "String",
                "length": 20,
                "id": 1
            },
            "email": {
                "type": "String",
                "required": false,
                "length": 60,
                "oracle": {
                    "columnName": "EMAIL",
                    "dataType": "VARCHAR",
                    "dataLength": 60,
                    "nullable": "Y"
                }
            },
            "firstName": {
                "type": "String",
                "required": false,
                "length": 40
            },
            "lastName": {
                "type": "String",
                "required": false,
                "length": 40
            }
        }
    }

If we run automigrate again, the table will be dropped and data will be lost.
Can we avoid that? Yes, autoupdate will do the job:

    ds.createModel(schema_v2.name, schema_v2.properties, schema_v2.options);

    ds.autoupdate(schema_v2.name, function (err, result) {
        ds.discoverModelProperties('CUSTOMER_TEST', function (err, props) {
            console.log(props);
        });
    });

## Part 5: Models by Instance Introspection

> I have JSON documents from REST services or NoSQL databases. Can LoopBack
get my models out of them?

Sample code:

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

## Summary

Now we learn that a few different use cases and how LoopBack handles the different
situations.

|Recipe                    | Use Case                                     |  Model Strict Mode   | Database     |
|:------------------------:|:--------------------------------------------:|:--------------------:|:------------:|
| Open Model               | Taking care of free-form data                | false                | NoSQL        |
| Plain Model              | Defining a model to represent data           | true or false        | NoSQL or RDB |
| Model from discovery     | Consuming existing data from RDB             | true                 | RDB          |
| Model from introspection | Consuming JSON data from NoSQL/REST          | false                | NoSQL        |

## References

1. https://github.com/strongloop/loopback-recipes
2. http://docs.strongloop.com/loopback/
3. http://docs.strongloop.com/loopback-connector-oracle/


