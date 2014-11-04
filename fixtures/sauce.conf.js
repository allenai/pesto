'use strict';

module.exports.config = {
  sauceUser: process.env.SAUCELABS_USERNAME,
  sauceKey: process.env.SAUCELABS_ACCESS_KEY,
  proxy: true,
  specs: [ 'src/test.js' ],
  capabilities: {
    browserName: 'chrome'
  }
};
