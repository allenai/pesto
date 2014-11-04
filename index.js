'use strict';

var fs = require('fs');
var q = require('q');
var util = require('util');
var bin = require('./lib/bin');
var colors = require('colors');
var path = require('path');
var SaucelabsSeleniumServer = require('./lib/saucelabs-selenium-server');
var LocalSeleniumServer = require('./lib/local-selenium-server');

/**
 * Runs integration tests using protractor and either a local selenium server or a sauce-labs
 * based selenium server.
 *
 * @example:
 * var pesto = require('pesto');
 * pesto('protractor.local.conf');
 * pesto('protractor.sauce.conf');
 *
 * @param {string} configFile The path to the appropriate protractor configuration file.
 *
 * @returns {Promise} A promise which is resolved once all associated tests have been executed.
 *                    The promise is resolved with a boolean indicating whether all tests
 *                    were successful.
 */
module.exports = function(configFile) {
  var executed = q.defer();

  // Complain if the configuration file isn't present
  if(!fs.existsSync(configFile) || !fs.statSync(configFile).isFile()) {
    executed.reject(util.format('Missing config file: "%s"', configFile));
  } else {
    // Read in their protractor configuration
    var config = require(path.resolve(process.cwd(), configFile)).config;
    var server;

    // If there's a sauceUser and sauceKey property, then assume we're using sauce labs
    // and kick things off
    if(config.sauceUser && config.sauceKey) {
      server = new SaucelabsSeleniumServer({
        username: config.sauceUser,
        key: config.sauceKey,
        proxy: config.proxy
      });
    }
    // Otherwise we'll assume we're running a local selenium instance
    else {
      server = new LocalSeleniumServer();
    }

    // Start the server.  Once started kick off protractor.
    server.start().then(
      function() {
        bin('protractor').exec(configFile)
          .on('exit', function(code) {
            server.stop().then(function() {
              // We resolve with true or false, depending on whether things succeeded or not.  Eventually
              // I'd like to make things a little less noisy, but for now we simply output everything
              // the supporting scripts do and then resolve with true or false, depending on whether
              // things were successful.
              var success = code === 0;

              // TODO: This reporting is noisy and should be handled elsewhere and/or be configurable
              console.log('-------------------------------------------'.cyan);
              console.log('[pesto]'.cyan + ' Status: ' + (success ? '✔ Success'.green : '× Failure'.red));
              console.log('-------------------------------------------'.cyan);

              executed.resolve(success);
            });
          });
      },
      function(err) {
        server.stop();
        executed.reject(err);
      }
    );
  }

  return executed.promise;
};

