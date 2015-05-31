# loopback-sample-recipes

The project contains a list of sample recipes to demonstrate various usage patterns of LoopBack models.

## Configure the data sources

The project ships a default configuration file [.loopbackrc[(.loopbackrc). You can customize it to use your own
database servers. For example,

        {
        "recipes": {
            "oracle": {
                "host": "127.0.0.1",
                "port": 1521,
                "database": "XE",
                "username": "loopback",
                "password": "password"
            },
            "mongodb": {
                "host": "127.0.0.1",
                "database": "lbdev",
                "username": "strongloop",
                "password": "password",
                "port": 27017
            },
            "mysql": {
                "host": "127.0.0.1",
                "port": 3306,
                "database": "recipes",
                "username": "loopback",
                "password": "password"
            }
        }

## List of recipes

- [open-model.js](recipes/open-model.js): An open model that accepts any properties
- [model.js](recipes/model.js): A simple model backed by MongoDB
- [model-auto-migration.js](recipes/model-auto-migration.js): Use Oracle connector's automigrate
- [model-auto-update.js](recipes/model-auto-update.js): Use Oracle connector's autoupdate
- [model-from-discovery.js](recipes/model-from-discovery.js): Use Oracle connector's discovery
- [model-from-instance.js](recipes/model-from-instance.js): Use JSON instance introspection

To run a recipe, for example, open-model:

    $ node recipes/open-model

## License
MIT
