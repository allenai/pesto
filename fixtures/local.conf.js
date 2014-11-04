'use strict';

module.exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [ 'src/test.js' ],
  capabilities: {
    browserName: 'chrome'
  }
};
