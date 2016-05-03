'use strict';

var crypto = require('crypto');
var encoder = require('./encoder');

module.exports = {
  check: function check(stashes, done) {
    var wrongMacs = stashes.filter(function (stash) {
      var hmac = crypto.createHmac('sha256', stash.hmacPlaintext);
      var contents = encoder.decode(stash.contents);
      hmac.update(contents);
      return hmac.digest('hex') !== stash.hmac;
    });

    if (wrongMacs.length > 0) {
      return done(new Error('Computed HMAC does not match store HMAC'));
    }

    return done(null, stashes);
  }
};