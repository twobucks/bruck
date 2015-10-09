var test = require('tape')
var evaluate = require('../').__evaluteTemplate

var TemplateError = require('./../template_error')

test('it evaluates expressions', function(t){
  t.equal(evaluate("%{1 + 2}"), "3", "expressions inside %{} tags are evaluated")
  t.end()
})

test('it raises errors when things go wrong', function(t){
  t.throws(function(){
    evaluate("%{chunky}")
  }, TemplateError, 'it raises errors')
  t.end()
})

test('it preserves original error with stack trace', function(t){
  try {
    evaluate("%{chunky}")
  } catch(ex){
    t.ok(ex.stack.indexOf('ReferenceError') > -1, 'ReferenceError is mentioned somewhere in the stack trace')
    t.end()
  }
})
