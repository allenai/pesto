'use strict';

var q = require('q');
var scp = require('./sauce-connect');
var merge = require('./merge');

function SaucelabsSeleniumServer(config) {
  this.config = merge({}, config);
}

SaucelabsSeleniumServer.prototype.start = function() {
  var started = q.defer();

  if(this.config.proxy) {
    scp(this.config.username, this.config.key).then(
      function(proxy) {
        this.proxy = proxy;
        started.resolve(this);
      }.bind(this),
      function() {
        started.reject();
      }
    )
  } else {
    // If a proxy isn't needed, then protractor does the rest -- sweet!
    started.resolve();
  }

  return started.promise;
}

SaucelabsSeleniumServer.prototype.stop = function() {
  var stopped = q.defer();

  if(this.proxy) {
    this.proxy.on('close', function() {
      stopped.resolve();
    });
    this.proxy.kill();
  } else {
    stopped.resolve();
  }

  return stopped.promise;
};

module.exports = SaucelabsSeleniumServer;