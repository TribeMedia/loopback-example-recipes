var ds = require('../data-sources/db')('oracle');

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
};

ds.createModel(schema_v1.name, schema_v1.properties, schema_v1.options);

ds.automigrate(function () {


    ds.discoverModelProperties('CUSTOMER_TEST', function (err, props) {
        console.log(props);
        ds.createModel(schema_v2.name, schema_v2.properties, schema_v2.options);

        ds.autoupdate(schema_v2.name, function (err, result) {
            ds.discoverModelProperties('CUSTOMER_TEST', function (err, props) {
                console.log(props);
            });
        });
    });


});
