const EventEmitter = require('events').EventEmitter;

const myEmitter = new EventEmitter();

module.exports = function() {
  return myEmitter;
}