pesto
=======

The perfect recipe for running integration tests of [AngularJS](https://angularjs.org/) based web applications.

* Start with a healthy serving of [AngularJS](https://angularjs.org/).
* Add a dash of [Protractor](http://angular.github.io/protractor/)
* And optionally enhance with a pinch of [SauceLabs](http://www.saucelabs.com).

Ultimately, pesto is a simple API for running integration tests using [Protractor](http://angular.github.io/protractor/) and other supporting technologies.

## Motivation

There's too many moving parts required to setup integration tests using Protractor and Angular:

**Before Pesto:**

```shell
npm install -g protractor

webdriver-manager update
webdriver-manager start

touch protractor.conf.js
vim protractor.conf.js

protractor protractor.conf.js
webdriver-manager stop
```

Add saucelabs to the mix and things get even crazier.

The goal of pesto is to make setting up and running integration tests as painless as possible.  As if testing isn't easy, then no one will do it.

**After Pesto:***

```shell
npm install -g pesto
touch protractor.conf.js
vim protractor.conf.js
pesto protractor.conf.js
```

Pesto comes loaded with the dependencies you need (plus it'll download any supporting binaries or jars you need at runtime).

## Installation

Install via `npm`:

```
npm install pesto
```

## Usage

```
pesto(config)
```

Where `config` is the path to the protractor configuration file.  

If `config` includes the `sauceUser` and `sauceKey` properties, then the [SauceLabs](http://www.saucelabs.com) service is used. You can also set the boolean `proxy` to true to enable a proxy making your local machine available to the [SauceLabs](http://www.saucelabs.com) virtual machine(s).

Otherwise a local Selenium server is used.

**Example Configuration with [SauceLabs](http://www.saucelabs.com):**

```javascript
exports.config = {
  sauceUser: process.env.SAUCELABS_USERNAME,
  sauceKey: process.env.SAUCELABS_ACCESS_KEY,
  proxy: true,
  specs: [ 'e2e-tests/**/*-test.js' ],
  multiCapabilities: [
    { browserName: 'firefox' },
    { browserName: 'chrome' },
    { browserName: 'internet explorer', platform: 'Windows 8', version: '10' }
  ]
};
```

**Exampe configuration with local Selenium Server:**

```javascript
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [ 'e2e-tests/**/*-test.js' ],
  multiCapabilities: [
    { browserName: 'firefox' },
    { browserName: 'chrome' }
  ]
};
```

## Examples

```javascript
var pesto = require('pesto');
pesto('path/to/protractor.conf.js').then(
  function(success) {
    console.log('Tests executed, result: ' + (success ? ' success!' : 'failure... :('));
  }
);
```

```javascript
var pesto = require('pesto');
var gutil = require('gulp-util');

gulp.task('e2e-tests', function(done) {
  pesto('path/to/protractor.conf.js').then(
    function(success) {
      gutil.log('Tests executed, result: ' + (success ? ' success!' : 'failure... :('));
      done();
    },
    function(err) {
      new gutil.PluginError('pesto', err);
      done();
    }
  );
});
```

You can also run `pesto` via the command line if installed globally (`npm install -g pesto`):

```shell
pesto path/to/config.js
```

## Next Up

Pesto is most certainly in an alpha state.  Immediate targets for refinement include:

* Cleanup log output.
* Add configurable log level and the ability to redirect logs output.
* Configurable reporters.
