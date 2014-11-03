'use strict';

var util = require('util');
var q = require('q');
var path = require('path');
var install = require('./install');
var bin = require('../bin');

/**
 * Starts a sauce-connect proxy and resolves the promise once it's up and ready.
 *
 * @param {string} username Saucelabs username.
 * @param {string} key      Saucelabs access key.
 *
 * @returns {Promise} A promise which is resolved once the proxy is ready.
 */
module.exports = function(username, key) {
  var ready = q.defer();

  install().then(
    function(installed) {
      // Start up a proxy
      var proxy = bin(path.resolve(installed.filename, 'bin', 'sc'), false).exec(
          [ '-u', username, '-k', key ]
        );

      // We look for a specific string in stdout as to indicate that we can kick our tests
      // off.
      // TODO: Come up with a better mechanism for detecting when we can execute tests
      var proxyOutListener = function(data) {
        if(data.toString().indexOf('Sauce Connect is up, you may start your tests.') !== -1) {
          proxy.stdout.removeListener('data', proxyOutListener);
          ready.resolve(proxy);
        }
      };
      proxy.stdout.on('data', proxyOutListener);

      proxy.on('error', function() {
        ready.reject();
      });
    },
    function(err) {
      ready.reject(err);
    }
  );

  return ready.promise;
};