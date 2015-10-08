var bruck = require('../')
var test = require('tape')
var fs = require('fs')
var exec = require('child_process').exec
var homeDir = require('home-dir')
var diff = require('hdiff')
var deepEqual = require('deep-equal')
var chdir = require('chdir')
var path = require('path')

var DIRECTORY_NAME = 'chunky-bacon'

function assertDescription (dir, description) {
  var packageJSON = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'))
  return packageJSON['description'] === description
}

function assertDirectoryExists (name, callback) {
  var stats = fs.statSync(name)
  return stats.isDirectory(name)
}

/*
 * Checks if package.json contains correct values
 * copied from ~/.bruckrc.
 */
function assertPackageJSONPopulated (dir, config) {
  var packageJSON = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'))
  var patch = diff(config, packageJSON)

  var keys = Object.keys(config)
  keys.forEach(function (key) {
    if (!deepEqual(config[key], patch[key])) {
      return false
    }
  })

  return true
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
  var data =  data || {
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
  fs.appendFileSync(homeDir('.bruckrc'), JSON.stringify(data))
}

function cleanUpBruckRC () {
  exec('rm ~/.bruckrc')
}

test('creates a new folder with the name that was passed', function (t) {
  bruck.exec(DIRECTORY_NAME, function () {
    t.ok(assertDirectoryExists(DIRECTORY_NAME), 'directory ' + DIRECTORY_NAME + ' exists')
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

  bruck.exec(DIRECTORY_NAME, function () {
    t.ok(assertPackageJSONPopulated(DIRECTORY_NAME, config),
         'package.json gets correct values from ~/.bruckrc')

    cleanUp(t.end)
    cleanUpBruckRC()
  })
})

test('populates readme with title and description it gets as arguments', function (t) {
  setupBruckRC()

  bruck.exec('npm-cat', 'meow meow', function () {
    t.ok(assertDirectoryExists('npm-cat'), 'directory named npm-cat exists')
    t.ok(assertDescription('npm-cat', 'meow meow'), 'description is "meow meow"')
    cleanUp(t.end)
  })
})

test.skip('creates LICENSE file')
test.skip('creates initial git commit')
