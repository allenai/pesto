'use strict';

var path = require('path');
var cp = require('child_process');
var pc = require('./protractor-config');
var merge = require('./merge');

// Default execution objects
var defaultOpts = { cwd: process.cwd(), env: process.env, stdio: 'pipe' };

/**
 * Utility function which returns an object with an exec method which executes the provided
 * protractor script with the provided argument and the default option.
 *
 * @param {string}  script                    The name of the protractor script to execute.
 * @param {boolean} [protractorScript=true]   Boolean indicating whether the script is a protractor script
 *                                            and should accordingly be resolved from the protractor
 *                                            module.
 *
 * @returns {object}  An object with an exec method for executing the specified script with the provided
 *                    arguments and optional execution options.
 */
module.exports = function(script, protractorScript) {
  script = typeof protractorScript === 'undefined' || protractorScript
    ? pc.bin(script)
    : script;
  return {
    exec: function(args, opts) {
      if(!Array.isArray(args)) {
        args = [ args ];
      }
      var p = cp.spawn(script, args, merge({}, defaultOpts, opts));
      // TODO: Better output pruning and reporting
      p.stdout.on('data', function(d) {
        process.stdout.write(d);
      });
      p.stderr.on('data', function(d) {
        process.stderr.write(d);
      });
      p.on('error', function(e) {
        process.stderr.write(e + '');
      });
      return p;
    }
  }
};