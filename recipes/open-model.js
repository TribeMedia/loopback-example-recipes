/**
 * This example creates an open model (a model allows properties that are not predefined)
 * Set the 'strict' property to be false in the options when the model is defined
 */
var loopback = require('loopback');
var app = loopback();

var ds = loopback.createDataSource('memory');

// Create a open model that doesn't require a schema
var FormModel = ds.createModel('form');

app.model(FormModel);
app.use(loopback.rest());

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




