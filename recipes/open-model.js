/**
 * This recipe creates an open model that allows properties that are not predefined.
 */
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

// You can also use the APIs create some instances first
/*
FormModel.create({x: 1, y: 2, z: 3}, function (err, form) {
    console.log('Form 1', form);
    FormModel.create({a: 'A', list: ['1', '2'], b: true, d: {x: 1, y: 2}}, function (err, form) {
        console.log('Form 2', form);

        FormModel.find(function (err, forms) {
            console.log('Forms', forms);
            app.listen(3000, function () {
                console.log('The form application is ready at http://127.0.0.1:3000');

                console.log('\nTo try it out, run the following command:');
                console.log('curl -X POST -H "Content-Type:application/json" -d \'{"a": 1, "b": "B"}\' http://127.0.0.1:3000/forms');
            });
        });
    });
});
*/




