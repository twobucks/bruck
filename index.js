/*
 * Copyright(c) 2015 Two Bucks Ltd.
 * MIT Licensed
 */

var fs = require('fs')
var chdir = require('chdir')
var merge = require('deep-extend')
var homeDir = require('home-dir')
var path = require('path')
var execSync = require('child_process').execSync

var TemplateError = require('./template_error')

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
    var self = this
    var callback = callback || function(){}

    if (typeof (description) === 'function') {
      callback = description
    }

    makeDir(name, function (error) {
      if (error) {
        throw error
      }

      var packageJSON = path.join(__dirname, 'template', 'package.json')
      var t = template(packageJSON)
      self.__copyLicense(name)
      self.__copyReadme(name, description)
      writePackageJSON(name, description, t, readBruckRC())
      self.__gitInit(name)

      callback()
    })
  },

  /*
   * Copies license from template.
   *
   * @param {string} dir target directory
   *
   * @private
   */

   __copyLicense: function(dir){
    var template = fs.readFileSync(path.join(__dirname, 'template', 'LICENSE'), 'utf8')
    fs.writeFileSync(path.join(dir, 'LICENSE'), this.__evaluteTemplate(template))
  },

  /*
   * Copies readme from template.
   *
   * @param {string} dir target directory
   *
   * @private
   */

   __copyReadme: function(name, description){
    var template = fs.readFileSync(path.join(__dirname, 'template', 'README.md'), 'utf8')
    fs.writeFileSync(path.join(name, 'README.md'), this.__evaluteTemplate(template, name, description))
  },

  /*
   * Initializes a new git repo inside a given directory.
   *
   * @param {string} dir target directory
   *
   * @private
   */

  __gitInit: function(dir){
    return execSync("cd " + dir + "; git init && git commit -am 'initial commit'; cd -")
  },

  /*
   * Evaluates expressions inside a template.
   * Expressions are surrounded with %{} tags.
   *
   * Example:
   *
   *   __evaluateTemplate("%{1 + 2}") === "3" // true
   *
   * @param {string} template
   * @returns {string} string after evaluation of all expressions
   *
   * @private
   */

  __evaluteTemplate: function(template, name, description){
    description = description || ""

    try {
    return template.replace(/\%\{([^\}]*)\}/g, function(_, match){
      return eval(match).toString()
    })
    } catch(ex) {
      throw new TemplateError(ex)
    }
  },
}

/*
 * Writes package.json by combining options passed.
 * Options from config take precedence.
 *
 * @param {string} directory target directory
 * @param {string} description
 * @param {Object} templateOptions
 * @param {Object} [configOptions] options read from config (~/.bruckrc by default)
 *
 * @private
 */

function writePackageJSON (directory, description, templateOptions, configOptions) {
  configOptions['description'] = description || configOptions['description']
  fs.appendFileSync(path.join(directory, 'package.json'), JSON.stringify(merge(templateOptions, configOptions)))
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
