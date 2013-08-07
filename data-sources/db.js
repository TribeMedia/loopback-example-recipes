/**
 * DataSources
 */

var loopback = require('loopback');

var config = require('./db.json');

var dataSources = {};

module.exports = function(dataSourceName) {
    dataSourceName = dataSourceName || process.env.DB || 'memory';
    if(dataSources[dataSourceName]) {
        return dataSources[dataSourceName];
    }
    var dataSourceConfig = config[dataSourceName];
    if(!dataSourceConfig) {
        console.error('DataSource definition not found:', dataSourceName);
        return null;
    }

    dataSourceConfig.connector = dataSourceConfig.connector || loopback.Memory;

    // console.log(dataSourceConfig);
    dataSources[dataSourceName] = loopback.createDataSource(dataSourceName, dataSourceConfig);
    return dataSources[dataSourceName];
}

/*
if(DB === 'memory') {
  // import data
  require('../test-data/import');
}
*/