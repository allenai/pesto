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
  var resolved = typeof protractorScript === 'undefined' || protractorScript
    ? pc.bin(script)
    : script;
  return {
    /**
     * Executes the associated script with the specified settings.
     *
     * @param {string[]}  args              Array of arguments to pass to the scfript.
     * @param {object}    [opts=undefined]  Optional execution options.  See
     *                                      http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
     * @param {boolean }  [silent=false]    Optional boolean indicating whether all stdout and stderr output
     *                                      should be silenced.
     *
     * @returns {ChildProcess} The spawned child process.
     */
    exec: function(args, opts, silent) {
      if(!Array.isArray(args)) {
        args = [ args ];
      }
      var p = cp.spawn(resolved, args, merge({}, defaultOpts, opts));
      // TODO: Better output pruning and reporting
      if(silent !== true) {
        p.stdout.on('data', function(d) {
          process.stdout.write(d + '');
        });
        p.stderr.on('data', function(d) {
          process.stderr.write(d + '');
        });
        p.on('error', function(e) {
          process.stderr.write(e + '');
        });
      }
      return p;
    }
  }
};