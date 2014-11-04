var server = require('../server');

describe('test', function() {
  beforeEach(function(done) {
    if(!server.isRunning()) {
      server.start(done);
    } else {
      done();
    }
  });

  it('has the correct title', function() {
    browser.get('http://localhost:4000');
    expect(browser.getTitle()).toEqual('Test');
  });

  it('has the correct text', function() {
    expect($$('#someonesetusupthebomb').get(0).getText())
      .toEqual('All your base are belong to us...');
  });
})