const EventEmitter = require('events').EventEmitter;

var myEmitter = new EventEmitter();

module.exports = function() {
  return myEmitter;
}