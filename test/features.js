var test = require('tape')
var exec = require('child_process').execSync
var fs = require('fs')

var DIRECTORY_NAME = 'booya'

function isDirPresent (name) {
  try {
    return fs.lstatSync(name).isDirectory
  } catch (ex) {
    return false
  }
}

test('creates a new folder with the name that was passed', function (t) {
  t.plan(1)
  exec('bruck ' + DIRECTORY_NAME)
  t.ok(isDirPresent(DIRECTORY_NAME), 'directory named \'' + DIRECTORY_NAME + '\' exists')
})

test.skip('populates package.json with the defaults saved in ~/.bruckrc')
test.skip('uses standard JS and JSDoc as dependencies (for now)')
test.skip('populates README with the deafults saved in ~/.bruckrc')
test.skip('creates LICENSE file')
test.skip('sets up testing environment')
test.skip('creates initial git commit')

fs.rmdirSync(DIRECTORY_NAME)
