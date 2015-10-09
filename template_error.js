/*
 * Creates a new TemplateError instance. Accepts two arguments,
 * the original exception and the message.
 *
 * Wraps itself around original exception, preserving its stack trace.
 *
 * @param {Error} originalException
 * @param {string} message
 *
 * @class
 */

module.exports = function TemplateError(originalException, message) {
  message = message || 'invalid expression'
  this.name = this.constructor.name
  this.stack = 'TemplateError: invalid expression\n\nOriginal Exception\n\n' + originalException.stack
  this.message = message
};

require('util').inherits(module.exports, Error);
