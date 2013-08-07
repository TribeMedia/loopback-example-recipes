/**
 * This example demonstrates how to discover data models from relational DBs.
 */
var ds = require('../data-sources/db.js')('oracle');

module.exports = generateInventory;

function generateInventory() {

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Discover and build models from INVENTORY table
     */
    ds.discoverAndBuildModels('INVENTORY', {visited: {}, associations: true}, function (err, models) {

        models.Product.find({}, function (err, products) {
            if (err) {
                console.error(err);
                return;
            }

            models.Location.find({}, function (err, locations) {
                if (err) {
                    console.error(err);
                    return;
                }

                locations.forEach(function (loc) {
                    products.forEach(function (weapon) {
                        var availableAtLocation = rand(0, 100);

                        models.Inventory.create({
                            productId: weapon.id,
                            locationId: loc.id,
                            available: rand(0, availableAtLocation),
                            total: availableAtLocation
                        });

                    });
                });

            });
        });
    });
}

if(require.main === module) {
    generateInventory();
}


