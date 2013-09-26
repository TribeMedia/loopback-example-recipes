# Recipes for LoopBack Models

Rich mobile applications are driven by data.
Data can be produced and consumed by mobile devices, browsers, cloud services, legacy applications, 
databases, and other backend systems.

LoopBack mobilizes data through _models_ that represent business data and behavior.  
LoopBack exposes models to mobile apps through REST APIs and client SDKs. 
Mobile developers need different ways to interact with models, depending on the location and type of data.

In this series of blogs, I'll walk you through some of the most important recipes for working with LoopBack models:

- Open models.
- Models with schema definitions.
- Model discovery with relational databases.
- Model synchronization with relational databases.
- Models by instance introspection.

Let's start with the simplest one: open models.

## Part 1: Open models

> I'm mobile developer. Can LoopBack help me save and load data transparently?
I don't need to worry about the backend or define the model up front, because my data are free-form.

For free-form data, use an _open model_ that allows you to set any properties on model instances.

The following code creates an open model and exposes it as a REST API.

```javascript
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
    });
```

Notice that we call `ds.createModel()` with only a name to create an open model.

To try it out, enter the following command:

    curl -X POST -H "Content-Type:application/json" -d '{"a": 1, "b": "B"}' http://127.0.0.1:3000/forms

This command POSTs some simple JSON data to the LoopBack */forms* URI.
<!-- Can we explain what this URI is and why it works? -->

The output that the app returns is a JSON object for the newly-created instance.

    {
      "id": "52389f5f7d365dd52a000005",
      "a": 1,
      "b": "B"
    }

The `id` field is a unique identifier you can use to retrieve the instance:

    curl -X GET http://127.0.0.1:3000/forms/52389f5f7d365dd52a000005

**Note: Your ID might be different. Please copy it from the POST response.**
<!-- Won't it always be different?  If so, then this should say 'Your ID will be different' -->

Try submitting a different form:

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
ensure it can be exchanged by multiple systems.

## Part 2: Models with schema definitions

> I want to build a mobile application that will interact with some backend
data. I would love to see a working REST API and mobile SDK before I implement
the server side logic.

In this case, we'll define a model first and use an in-memory data source to
mock up the data access. You'll get a fully-fledged REST API without writing
a lot of server side code.

```javascript
    var loopback = require('loopback');

    var ds = loopback.createDataSource('memory');

    var Customer = ds.createModel('customer', {
        id: {type: Number, id: true},
        name: String,
        emails: [String],
        age: Number});
````

You can now test the CRUD operations on the server side.
The following code creates two customers, finds a customer by ID, and then finds customers
by name to return up to three customer records.

```javascript
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
````

To expose the model as REST APIs, use the following:

```javascript
    var app = loopback();
    app.model(Customer);
    app.use(loopback.rest());
    app.listen(3000, function() {
        console.log('The form application is ready at http://127.0.0.1:3000');
    });
```

Until now the data access has been backed by an in-memory store. To make your data
persistent, you simply replace it with a MongoDB database by changing the
data source configuration:

```javascript
    var ds = loopback.createDataSource('mongodb', {
        "host": "demo.strongloop.com",
        "database": "demo",
        "username": "demo",
        "password": "L00pBack",
        "port": 27017
    });
````

When defining a model, it may be troublesome to define all the properties from scratch.
Fortunately, LoopBack can discover a model definition from
existing systems such as relational databases or JSON documents.

## Part 3: Model Discovery with Relational Databases

> I have data in an Orcale database. Can LoopBack figure out the
models and expose them as APIs to my mobile applications?

LoopBack makes it surprisingly simple to create models from existing data, 
as illustrated below for an Oracle database.
First, the code sets up the Oracle data source and then it calls `discoverAndBuildModels()` to create 
models from the database tables. The 'association' option is set to true so that the discovery
follows primary/foreign key relations.

````javascript
    var loopback = require('loopback');

    var ds = loopback.createDataSource('oracle', {
                "host": "demo.strongloop.com",
                "port": 1521,
                "database": "XE",
                "username": "demo",
                "password": "L00pBack"
            });

    // Discover and build models from INVENTORY table
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
````

Discovery from relational databases is a quick way to consume existing data with well-defined schemas. 
However, some data stores don't have schemas; for example, MongoDB or REST services. LoopBack has another option
here.
<!-- Should this really be mentioned here?  It sounds like you're about to describe this "other option".
If not, then say WHERE it will be described (future blog, docs, etc.)
--->

## Part 4: Model synchronization with relational databases

> Now I have defined a LoopBack model, can LoopBack create or update the
database schemas for me?

LoopBack provides two methods to synchronize database model definitions with table schemas:

- Auto-migrate: Automatically create or re-create the table schemas based on the
model definitions. **WARNING: An existing table will be dropped if its name matches
the model name.**
- Auto-update: Automatically alter the table schemas based on the model definitions.

Let's start with first version of the model definition:

````javascript
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
````

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


