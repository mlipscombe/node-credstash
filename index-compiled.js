'use strict';

var async = require('async');
var decrypter = require('./lib-compiled/decrypter');
var encoder = require('./lib-compiled/encoder');
var hmac = require('./lib-compiled/hmac');
var keys = require('./lib-compiled/keys');
var secrets = require('./lib-compiled/secrets');
var xtend = require('xtend');

var defaults = {
  limit: 1
};

function Credstash(config) {
  this.table = config ? config.table : undefined;
  this.awsConfig = config.awsConfig;
}

Credstash.prototype.get = function (name, context, options, done) {
  if (typeof context === 'function') {
    options = context;
    context = undefined;
  }

  if (typeof options === 'function') {
    done = options;
    options = defaults;
  } else {
    options = xtend(defaults, options);
  }

  return async.waterfall([async.apply(secrets.get, this.table, name, options, this.awsConfig), async.apply(keys.decrypt(this.awsConfig, context)), async.apply(hmac.check), async.apply(decrypter.decrypt)], function (err, secrets) {
    if (err) {
      return done(err);
    }

    if (options.limit === 1) {
      return done(null, secrets && secrets[0]);
    }

    done(null, secrets);
  });
};

module.exports = Credstash;
