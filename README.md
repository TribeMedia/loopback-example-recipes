# loopback-recipes

LoopBack recipes to demonstrate various usage patterns.

## Configure the data sources

You need to provide .loopbackrc file in the project or home directory, for example:

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

## Recipes

- model.js: A simple model backed by MongoDB
- model-auto-migration.js: Use Oracle connector's automigrate
- model-auto-update.js: Use Oracle connector's autoupdate
- model-from-discovery.js: Use Oracle connector's discovery
- model-from-instance.js: Use JSON instance introspection
- open-model.js: An open model that accepts any properties


