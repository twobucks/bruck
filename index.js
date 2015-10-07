var fs = require('fs')
var chdir = require('chdir')

module.exports = {
 /*
  * Entry point. Creates NPM package directory
  * that is ready for development.
  *
  * @param {string} name - the package name
  * @param {string} description - the package description
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

      inDir(name, function () {
      })

      callback()
    })
  }
}

/*
 * Creates empty directory.
 *
 * @param {string} dir - the directory name
 *
 * @private
 */
function makeDir (dir, callback) {
  fs.mkdir(dir, callback)
}

/*
 * Evaluates callback inside the passed directory.
 *
 * @param {string} dir - the directory name
 * @param {function} callback - function to be called
 *
 * @private
 */
function inDir (dir, callback) {
  chdir(dir, callback)
}
