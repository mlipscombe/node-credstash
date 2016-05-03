'use strict';

module.exports = {
  encode: function encode(s) {
    return new Buffer(s).toString('base64');
  },
  decode: function decode(s) {
    return new Buffer(s, 'base64');
  }
};