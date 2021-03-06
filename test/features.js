var bruck = require('../')
var test = require('tape')
var fs = require('fs')
var exec = require('child_process').exec
var execSync = require('child_process').execSync
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
 * from ~/.bruckrc.
 */
function assertPackageJSONPopulated (t, dir, config) {
  var packageJSON = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'))
  var patch = diff(config, packageJSON)
  var keys = Object.keys(config)

  keys.forEach(function (key) {
    if (!deepEqual(config[key], patch[key])) {
      t.ok(config[key] === patch[key], key + " is not equal " + patch[key])
    }
  })
}

function assertLicenseYear(dir){
  var license = fs.readFileSync(path.join(dir, 'LICENSE'), 'utf-8').toString()
  return license.indexOf(new Date().getFullYear()) > -1
}

function assertFileMatches(path, regex){
  var data = fs.readFileSync(path).toString()
  return !!data.match(regex)
}

function assertGitInitialized(dir){
  try {
    return execSync('ls ' + dir + '/.git')
  } catch(ex){
    return false
  }
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
    "devDependencies": {
      "deep-equal": "^1.0.1",
      "hdiff": "^1.1.2",
      "standard": "^3.0.0",
      "tap-spec": "^4.1.0",
      "tape": "^4.2.1"
    }
  }
  fs.appendFileSync(homeDir('.bruckrc'), JSON.stringify(data))
}

function cleanUpBruckRC () {
  exec('rm ~/.bruckrc')
}

test('creates a new folder with the name that was passed', function (t) {
  bruck.exec(DIRECTORY_NAME, function () {
    t.ok(assertDirectoryExists(DIRECTORY_NAME), 'directory "' + DIRECTORY_NAME + '" exists')
    cleanUp(t.end)
  })
})

test('populates package.json with the defaults saved in ~/.bruckrc', function (t) {
  var config = {
    "version": "1.0.0",
    "main": "index.js",
    "scripts": {
      "test": "rm -rf npm-cat chunky-bacon ~/.bruckrc && tape ./test/*.js | tap-spec"
    },
    "keywords": [],
    "author": "Hrvoje Simic <shime@twobucks.co>",
    "license": "MIT",
    "devDependencies": {
      "deep-equal": "^1.0.1",
      "standard": "^3.0.0",
      "tap-spec": "^4.1.0",
      "tape": "^4.2.1"
    },
    "bin": {
      "bruck": "bin/bruck"
    },
    "dependencies": {
      "chdir": "0.0.0",
      "deep-extend": "^0.4.0",
      "home-dir": "^1.0.0"
    }
  }
  setupBruckRC(config)

  bruck.exec(DIRECTORY_NAME, function () {
    assertPackageJSONPopulated(t, DIRECTORY_NAME, config),
         'package.json gets correct values from ~/.bruckrc'

    cleanUp(t.end)
    cleanUpBruckRC()
  })
})

test('populates package.json with the correct title/description', function (t) {
  bruck.exec('name', 'description', function () {
    assertPackageJSONPopulated(t, 'name', {
      name: 'name',
      description: 'description'
    }, 'package.json has the correct title/description')
    exec('rm -rf name', t.end)
  })
})

test('populates readme with title and description it gets as arguments', function (t) {
  setupBruckRC()

  bruck.exec(DIRECTORY_NAME, 'meow meow', function () {
    t.ok(assertDescription(DIRECTORY_NAME, 'meow meow'), 'description is "meow meow"')
    cleanUp(t.end)
  })
})

test('creates LICENSE file with proper year', function(t){
  bruck.exec(DIRECTORY_NAME, function () {
    t.ok(assertLicenseYear(DIRECTORY_NAME), 'license contains current year')
    cleanUp(t.end)
  })
})

test('creates README file and with the correct title', function(t){
  bruck.exec('chunky-bacon', function(){
    t.ok(assertFileMatches('chunky-bacon/README.md', /# chunky-bacon/),
        'readme title is \'chunky-bacon\'')
    cleanUp(t.end)
  })
})

test('creates README file and with the correct description', function(t){
  bruck.exec('chunky-bacon', 'super tasty bacon', function(){
    t.ok(assertFileMatches('chunky-bacon/README.md', /super tasty bacon/),
        'readme description is \'super tasty bacon\'')
    cleanUp(t.end)
  })
})

test('creates README file with Travis badge', function(t){
  bruck.exec('chunky-bacon', function(){
    t.ok(assertFileMatches('chunky-bacon/README.md', "https://travis-ci.org/twobucks/chunky-bacon"),
        'readme description is \'super tasty bacon\'')
    cleanUp(t.end)
  })
})

test('creates initial git commit', function(t){
  bruck.exec('chunky-bacon', function(){
    t.ok(assertGitInitialized('chunky-bacon'), 'git directory exists')
    cleanUp(t.end)
  })
})
