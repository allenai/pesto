var express = require('express');

var app = express();
app.use(express.static('src'));

var server;

module.exports = {
  start: function(cb) {
    server = app.listen(4000, cb);
    return this;
  },
  isRunning: function() {
    return typeof server !== 'undefined';
  },
  stop: function(cb) {
    if(server) {
      server.close(function() {
        server = undefined;
        cb();
      });
    } else {
      cb();
    }
    return this;
  }
};
