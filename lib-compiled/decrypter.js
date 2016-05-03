'use strict';

var aesjs = require('aes-js');
var encoder = require('./encoder');

module.exports = {
  decrypt: function decrypt(stashes, done) {
    var decrypted = stashes.map(function (stash) {
      var key = stash.keyPlaintext;
      var value = encoder.decode(stash.contents);
      var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(1));
      var decryptedBytes = aesCtr.decrypt(value);
      return decryptedBytes.toString();
    });

    return done(null, decrypted);
  }
};