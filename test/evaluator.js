var test = require('tape')
var evaluate = require('../').__evaluteTemplate

test('it evaluates expressions', function(t){
  t.equal(evaluate("%{1 + 2}"), "3", "expressions inside %{} tags are evaluated")
  t.end()
})

test.skip('it raises meaningful errors when things go wrong')
