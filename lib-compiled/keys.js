'use strict';

var AWS = require('aws-sdk');
var async = require('async');
var encoder = require('./encoder');

function _decrypt(key, done) {
  var params = {
    CiphertextBlob: encoder.decode(key)
  };

  return new AWS.KMS().decrypt(params, done);
}

function split(stashes, decryptedKeys, done) {
  var result = stashes.map(function (stash, index) {
    stash.keyPlaintext = new Buffer(32);
    stash.hmacPlaintext = new Buffer(32);
    decryptedKeys[index].Plaintext.copy(stash.keyPlaintext, 0, 0, 32);
    decryptedKeys[index].Plaintext.copy(stash.hmacPlaintext, 0, 32);
    return stash;
  });
  return done(null, result);
}

module.exports = {
  decrypt: function decrypt(stashes, done) {
    return async.waterfall([async.apply(async.map, stashes.map(function (s) {
      return s.key;
    }), _decrypt), async.apply(split, stashes)], done);
  }
};