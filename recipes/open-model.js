/**
 * This example creates an open model (a model allows properties that are not predefined)
 * Set the 'strict' property to be false in the options when the model is defined
 */
var ds = require('../data-sources/db.js')('mongodb');

// Create a open model that doesn't require a schema
var Application = ds.createModel('MyApplication');

// The application model can take any properties
var application = {
    owner: 'rfeng',
    name: 'MyApp1',
    description: 'My first app',
    pushSettings: [
        {   "platform": "apns",
            "apns": {
                "pushOptions": {
                    "gateway": "gateway.sandbox.push.apple.com",
                    "cert": "credentials/apns_cert_dev.pem",
                    "key": "credentials/apns_key_dev.pem"
                },

                "feedbackOptions": {
                    "gateway": "feedback.sandbox.push.apple.com",
                    "cert": "credentials/apns_cert_dev.pem",
                    "key": "credentials/apns_key_dev.pem",
                    "batchFeedback": true,
                    "interval": 300
                }
            }}
    ]};

// Create a new instance
console.log(new Application(application).toObject());

// Create a new instance and save it
Application.create(application, function (err, app1) {
    console.log('Created: ', app1.toObject());
    // Find the application instance by id
    Application.findById(app1.id, function (err, app2) {
        console.log('Found: ', app2.toObject());
        process.exit(0);
    });
});

