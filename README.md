pesto
=======

The perfect recipe for running integration tests of [AngularJS](https://angularjs.org/) based web applications.

* Start with a healthy serving of [AngularJS](https://angularjs.org/).
* Add a dash of [Protractor](http://angular.github.io/protractor/)
* And optionally enhance with a pinch of [SauceLabs](http://www.saucelabs.com).

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

If `config` includes `sauceUser` and `sauceKey` the [SauceLabs](http://www.saucelabs.com) service is used. You can also set the boolean `proxy` to true to enable a proxy making your local machine available to the [SauceLabs](http://www.saucelabs.com) virtual machine(s).

Alternatively a local Selenium server is used.

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
pesto('path/to/proctractor.conf.js').then(
  function(success) {
    console.log('Tests executed, result: ' + (success ? ' success!' : 'failure... :('));
  }
);
```

```javascript
var pesto = require('pesto');
var gutil = require('gulp-util');

gulp.task('e2e-tests', function(done) {
  pesto('path/to/proctractor.conf.js').then(
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
