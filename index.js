/*
 * Copyright(c) 2015 Two Bucks Ltd.
 * MIT Licensed
 */

var fs = require('fs')
var chdir = require('chdir')
var merge = require('deep-extend')
var homeDir = require('home-dir')
var path = require('path')

module.exports = {
 /*
  * Entry point. Creates NPM package directory
  * that is ready for development.
  *
  * @param {string} name the package name
  * @param {string} description the package description
  * @param {function} callback
  *
  * @public
  */

  exec: function (name, description, callback) {
    if (typeof (description) === 'function') {
      callback = description
    }

    makeDir(name, function (error) {
      if (error) {
        throw error
      }

      var packageJSON = path.join('template', 'package.json')
      var t = template(packageJSON)
      chdir(name, function () {
        writePackageJSON(description, t, readBruckRC())
      })
      callback()
    })
  }
}

/*
 * Writes package.json by combining options passed.
 * Options from config take precedence.
 *
 * @param {string} description
 * @param {Object} templateOptions
 * @param {Object} [configOptions] options read from config (~/.bruckrc by default)
 *
 * @private
 */

function writePackageJSON (description, templateOptions, configOptions) {
  configOptions['description'] = description || configOptions['description']
  fs.appendFileSync('package.json', JSON.stringify(merge(templateOptions, configOptions)))
}

/*
 * Reads file from template directory.
 *
 * @param {string} path path to file to be read
 * @returns {Object}
 *
 * @private
 */

function template (filePath) {
  return JSON.parse(fs.readFileSync(filePath))
}

/*
 * Reads from config file.
 *
 * @param {string} [configPath="$HOME/.bruckrc"] path to config file
 *
 * @private
 */

function readBruckRC (configPath) {
  configPath = configPath || homeDir('.bruckrc')

  try {
    return JSON.parse(fs.readFileSync(configPath))
  } catch (ex) {
    return {}
  }
}

/*
 * Creates empty directory.
 *
 * @param {string} dir the directory name
 * @param {function} callback
 *
 * @private
 */

function makeDir (dir, callback) {
  fs.mkdir(dir, callback)
}
