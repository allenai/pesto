'use strict';

var request = require('request');
var q = require('q');
var util = require('util');
var bin = require('./bin');

// Maximum number of times to check if the selenium server is running
var MAX_ATTEMPTS = 5;
// Wait 250 milliseconds between checks
var DELAY = 250;

/**
 * Utility method for executing the provided promise up to max times
 *
 * @param {function}  fn  The function to execute.
 * @param {number}    max The maximum number of times to attempt the provided function.
 *
 * @returns {Promise} A promise is resolved if the check succeeds before max attempts.
 */
function check(fn, max) {
  var deferred = q.defer();
  var tries = 0;
  var maybeTryAgain = function() {
    if(++tries <= max) {
      fn().then(
        function() {
          deferred.resolve();
        },
        setTimeout(maybeTryAgain, DELAY)
      );
    } else {
      deferred.reject();
    }
  };
  maybeTryAgain();
  return deferred.promise;
}

/**
 * Queries selenium locally to see if it is running and calls the provided callback
 * if it running.
 *
 * @returns {Promise} A promise which is resolved if the server is running.
 */
function ifSeleniumServerIsRunning() {
  var running = q.defer();
  request.get('http://localhost:4444/wd/hub/status', function(err, response, body) {
    if(body) {
      if(typeof body !== 'object') {
        try {
          body = JSON.parse(body);
        } catch(e) {
          running.reject();
        }
      }
      if(body.state && body.state === 'success') {
        running.resolve();
      }
    }
  });

  return running.promise;
}

function LocalSeleniumServer() {};

LocalSeleniumServer.prototype.start = function() {
  var started = q.defer();

  // First execute the update command, just in case selenium needs to download any drivers
  // or driver updates.
  console.log('Updating Selenium Drivers');
  bin('webdriver-manager').exec('update')
    .on('exit', function(code) {
      // Success!
      if(code === 0) {
        console.log('Update complete, starting local Selenium Server');
        // Now start up the selenium server locally.
        this.server = bin('webdriver-manager').exec('start', undefined, true);

        // After receiving some indication that the above script has executed, check if
        // selenium is running.  Once running we can kick off our tests
        var isSeleniumRunning = function(d) {
          if(d.toString().indexOf('Started org.openqa.jetty.jetty.Server') !== -1) {
            this.server.stderr.removeListener('data', isSeleniumRunning);
            // Check if the serves is running up to 5 times.
            check(ifSeleniumServerIsRunning, MAX_ATTEMPTS).then(
              function() {
                console.log('Selenium Server running at http://localhost:4444/wd/hub');
                // Nice! We're up an running.
                started.resolve();
              },
              function() {
                var message = util.format(
                    'Failed to start local selenium server after %d attempts', 5
                  );
                console.error(message);
                started.reject(message);
              }
            );
          }
        }.bind(this);
        // The output we're looking for goes into stderr for some reason...
        this.server.stderr.on('data', isSeleniumRunning);
      } else {
        var message = 'Unable to update local selenium server';
        console.error(message);
        started.reject(message);
      }
    }.bind(this));

  return started.promise;
};

LocalSeleniumServer.prototype.stop = function() {
  var stopped = q.defer();

  if(this.server) {
    // We're done. Kill the server.
    this.server.once('close', function() {
      stopped.resolve();
    });

    // See https://github.com/angular/protractor/blob/master/bin/webdriver-manager#L260
    // Sending anything to web-driver manager after the script has started attempts
    // a graceful shutdown of the server.
    this.server.stdin.write('stop');
  } else {
    stopped.resolve();
  }

  return stopped.promise;
};

module.exports = LocalSeleniumServer;