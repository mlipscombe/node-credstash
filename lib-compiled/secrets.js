'use strict';

var AWS = require('aws-sdk');
var async = require('async');

function find(table, name, options, awsConfig, done) {
  var params = {
    TableName: table || 'credential-store',
    ConsistentRead: true,
    Limit: options.limit,
    ScanIndexForward: false,
    KeyConditions: {
      name: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{
          S: name
        }]
      }
    }
  };

  return new AWS.DynamoDB(awsConfig).query(params, done);
}

function map(name, data, done) {
  if (!data.Items || data.Items.length === 0) {
    return done(new Error('secret not found: ' + name));
  }

  var result = data.Items.map(function (item) {
    return {
      key: item.key.S,
      hmac: item.hmac.S,
      contents: item.contents.S
    };
  });

  return done(null, result);
}

module.exports = {
  get: function get(table, name, options, awsConfig, done) {
    return async.waterfall([async.apply(find, table, name, options, awsConfig), async.apply(map, name)], done);
  }
};