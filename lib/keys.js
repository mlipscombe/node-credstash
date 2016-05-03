const AWS = require('aws-sdk');
const async = require('async');
const encoder = require('./encoder');

function decrypt(awsConfig) {
  return (key, done) => {
    var params = {
      CiphertextBlob: encoder.decode(key)
    };

    return new AWS.KMS(awsConfig).decrypt(params, done);
  }
}

function split(stashes, decryptedKeys, done) {
  var result = stashes.map((stash, index) => {
    stash.keyPlaintext = new Buffer(32);
    stash.hmacPlaintext = new Buffer(32);
    decryptedKeys[index].Plaintext.copy(stash.keyPlaintext, 0, 0, 32);
    decryptedKeys[index].Plaintext.copy(stash.hmacPlaintext, 0, 32);
    return stash;
  });
  return done(null, result);
}

module.exports = {
  decrypt: (awsConfig) => {
    return (stashes, done) => {
      return async.waterfall([
        async.apply(async.map, stashes.map(s => s.key), decrypt(awsConfig)),
        async.apply(split, stashes)
      ], done);
    }
  }
};
