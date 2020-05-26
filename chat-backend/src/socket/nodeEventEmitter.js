const EventEmitter = require('events').EventEmitter;

const myEmitter = new EventEmitter();
myEmitter.setMaxListeners(1);

module.exports = function() {
  return myEmitter;
}