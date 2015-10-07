var bruck = require('../')
var test = require('tape')
var fs = require('fs')
var exec = require('child_process').exec
var homeDir = require('home-dir')
var diff = require('hdiff')
var deepEqual = require('deep-equal')

var DIRECTORY_NAME = 'chunky-bacon'

function assertDescription(t, description){
  // TODO
}

function assertDirectoryExists (t, name) {
  stat(name, function (data) {
    t.ok(data.isDirectory(name),
         'directory named ' + name + ' exists')
  })
}

function bruckExec (name, description, callback) {
  if (!callback) {
    callback = description
  }

  if (!description) {
    callback = name
  }

  if (typeof (name) === 'function') {
    callback = name
    name = DIRECTORY_NAME
  }

  bruck.exec(name, callback)
}

function cleanUp (callback) {
  exec('rm -rf ' + DIRECTORY_NAME, callback)
}
cleanUp()

function stat (dir, callback) {
  fs.stat(dir, function (error, data) {
    if (error) {
      throw error
    }

    callback(data)
  })
}

function setupBruckRC (data) {
  fs.appendFileSync(homeDir('.bruckrc'), data)
}

function cleanUpBruckRC () {
  exec('rm ~/.bruckrc')
}

/*
 * Checks if package.json contains correct values
 * copied from ~/.bruckrc.
 */
function isPackageJSONCorrect (config) {
  var packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
  var patch = diff(config, packageJSON)

  var keys = Object.keys(config)
  keys.forEach(function (key) {
    if (!deepEqual(config[key], patch[key])) {
      return false
    }
  })

  return true
}

test('creates a new folder with the name that was passed', function (t) {
  bruckExec(function () {
    assertDirectoryExists(t, DIRECTORY_NAME)
    cleanUp(t.end)
  })
})

test('populates package.json with the defaults saved in ~/.bruckrc', function (t) {
  var config = {
    'scripts': {
      'test': 'standard && node ./test/*.js | tap-spec'
    },
    'author': 'Hrvoje Simic <shime@twobucks.co>',
    'license': 'MIT',
    'devDependencies': {
      'deep-equal': '^1.0.1',
      'hdiff': '^1.1.2',
      'standard': '^3.0.0',
      'tap-spec': '^4.1.0',
      'tape': '^4.2.1'
    }
  }
  setupBruckRC(config)

  bruckExec(function () {
    t.ok(isPackageJSONCorrect(config), 'package.json gets correct values from ~/.bruckrc')
    cleanUp(t.end)
    cleanUpBruckRC()
  })
})

test('populates readme with title and description it gets as arguments', function (t) {
  // TODO: CLI
  bruckExec('npm-cat', 'meow meow', function () {
    assertDirectoryExists(t, 'npm-cat')
    assertDescription()
    cleanUp(t.end)
  })
})

test.skip('creates LICENSE file')
test.skip('creates initial git commit')
