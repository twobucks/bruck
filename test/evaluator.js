var test = require('tape')
var evaluate = require('../').__evaluteTemplate

test('it evaluates expressions', function(t){
  t.equal(evaluate("%{1 + 2}"), "3", "expressions inside %{} tags are evaluated")
  t.end()
})

test('it raises errors when things go wrong', function(t){
  t.throws(function(){
    evaluate("%{chunky}")
  }, /chunky is not defined/, 'it raises errors')
  t.end()
})

test.skip('it gives more information about the error') // where and why - the most important questions when it comes to debugging
