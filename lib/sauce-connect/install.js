'use strict';

var path = require('path');
var request = require('request');
var util = require('util');
var unzip = require('unzip');
var fs = require('fs');
var q = require('q');

// The directory where we'll stick the sauce-connect binaries
var dir = path.resolve(__dirname, '..', '..', 'etc');

// Mapping of platforms to the appropriate binaries
var urls = {
  'darwin': 'https://saucelabs.com/downloads/sc-4.3.5-osx.zip',
  'linux': 'https://saucelabs.com/downloads/sc-4.3.5-linux.tar.gz',
  'win32': 'https://saucelabs.com/downloads/sc-4.3.5-win32.zip'
};

/**
 * @class
 * @constructs
 *
 * Representation of successful installation.
 */
function SuccessfulInstall(fresh, filename) {
  this.fresh = fresh;
  this.filename = filename;
}

/**
 * Downloads the appropriate sauce-lab binary for the current platform.
 *
 * @returns {Promise} A promise resolved with an SuccessfulInstall instance. If the installation
 *                    fails the promise is rejected with the associated error message.
 */
module.exports = function() {
  var installed = q.defer();

  if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  if(urls[process.platform]) {
    var url = urls[process.platform];
    var fn = path.resolve(dir, url.split('/').pop().replace('.zip', ''));

    if(!fs.existsSync(fn)) {
      request(url)
        .pipe(unzip.Extract({ path: dir }))
        .on('error', function(err) {
          installed.reject(util.format('Error downloading "%s": %s', url, err));
        })
        .on('close', function() {
          // For some reason the binary doesn't come with the correct permissions, so let's fix that
          // for them.
          fs.chmodSync(path.resolve(fn, 'bin', 'sc'), 755);
          installed.resolve(new SuccessfulInstall(true, fn));
        });
    } else {
      installed.resolve(new SuccessfulInstall(false, fn));
    }
  } else {
    installed.reject(util.format('Sorry! The "%s" platform isn\'t supported by SauceLabs' +
        ' Connect yet.  You can still use a local protractor configuration, or use a publicly ' +
        ' accessible url for testing.', process.platform)
      );
  }

  if(!fs.statSync(dir).isDirectory()) {
    installed.reject(util.format('Target "%s" exists and isn\'t a directory.', process.platform));
  }

  return installed.promise;
};