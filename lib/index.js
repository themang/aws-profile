/**
 * Modules
 */

var ini = require('ini')
var fs = require('fs')
var touch = require('touch')
var assign = require('object-assign')
var path = require('path')

/**
 * Vars
 */

var home = process.env.HOME
var configDir = path.join(home, '/.aws')
var credentialsPath = path.join(home, '.aws/credentials')
var configPath = path.join(home, '/.aws/config')

exports.add = function (profile, cred, config) {
  if (!profile) {
    profile = 'default'
  }

  var ini = readIni()
  ini.credentials[profile] = assign(ini.credentials[profile] || {}, cred)
  ini.config[profile] = assign(ini.config[profile] || {region: 'us-west-2', output: 'json'}, config)
  writeIni(ini)

}

exports.get = function (profile) {
  var configs = readIni()
  return assign(
    {},
    configs.credentials[profile] || {},
    configs.config[profile] || {}
  )

}

exports.delete = function (profile) {
  if (!profile) {
    throw new Error('Must specify profile.')
  }
  var ini = readIni()
  delete ini.credentials[profile]
  delete ini.config[profile]
  writeIni(ini)
}

function readIni () {
  ensureIni()

  var credentials = ini.parse(fs.readFileSync(credentialsPath, 'utf-8'))
  var config = ini.parse(fs.readFileSync(configPath, 'utf-8'))

  return {
    credentials: credentials,
    config: config
  }
}

function writeIni (shared) {
  fs.writeFileSync(credentialsPath, ini.stringify(shared.credentials))
  fs.writeFileSync(configPath, ini.stringify(shared.config))
}

function ensureIni () {
  if (fs.existsSync(configDir)) {
    return
  }

  fs.mkdirSync(configDir)
  touch.sync(credentialsPath)
  touch.sync(configPath)
}
