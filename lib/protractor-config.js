'use strict';

var path = require('path');

// Protractor resolves to node_modules/protractor/lib/protractor, but we want the
// package.json file so we need to look up one directory.
var base = require.resolve('protractor').split('protractor').shift() + 'protractor';

/**
 * Object with methods for querying information about the current module's protractor
 * installation.
 */
module.exports = {
  /**
   * Returns an object with the protractor module configuration (package.json).
   *
   * @returns {object} The protractor module configuration.
   */
  config: function() {
    return require(path.resolve(base, 'package.json'));
  },
  /**
   * Returns the fully qualified path to the specified protractor bin script.
   *
   * @param {string} script The protractor script name.
   *
   * @returns {string} The fully qualified path to the script.
   */
  bin: function(script) {
    var config = this.config();
    if(!config.bin.hasOwnProperty(script)) {
      throw 'Invalid protractor script: "' + script + '"';
    }
    return path.resolve(base, config.bin[script]);
  }
};
