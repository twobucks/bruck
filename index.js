var fs = require('fs')
var chdir = require('chdir')

module.exports = {
 /*
  * Entry point. Creates NPM package directory
  * that is ready for development.
  *
  * @param {string} dir - the directory name
  *
  * @public
  */
  exec: function (dir, callback) {
    checkSetup()

    makeDir(dir, function (error) {
      if (error) {
        throw error
      }

      inDir(dir, function () {
      })

      callback()
    })
  }
}

/*
 * Checks if configuration file is setup up
 * properly.
 *
 * @private
 */
function checkSetup () {
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
