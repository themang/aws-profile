/**
 * Modules
 */

var ini = require('ini')
var fs = require('fs')
var touch = require('touch')
var assign = require('object-assign')
var path = require('path')
var R = require('ramda')
var toCamel = require('camel-case')
var toSnake = require('snake-case')

/**
 * Vars
 */

var home = process.env.HOME
var configDir = path.join(home, '/.aws')
var credentialsPath = path.join(home, '.aws/credentials')
var configPath = path.join(home, '/.aws/config')


exports.add = function (profile, config) {
  profile = profile || 'default'
  writeConfig(profile, config)
}

exports.get = function (profile) {
  profile = profile || 'default'
  return readConfig(profile)
}

exports.delete = function (profile) {
  if (!profile) {
    throw new Error('Must specify profile.')
  }
  writeConfig(profile, null)
}

var credentials = ['aws_access_key_id', 'aws_secret_access_key']
function writeConfig (profile, config) {
  var out = readIni()
  if (config) {
    out[profile] = R.merge(out[profile], toIni(config))
  } else {
    delete out[profile]
  }

  fs.writeFileSync(credentialsPath, ini.stringify(R.mapObj(function(conf) {
    return R.pick(credentials, conf)
  }, out)))

  fs.writeFileSync(configPath, ini.stringify(R.mapObj(function(conf) {
    return R.omit(credentials, conf)
  }, out)))
}

function readConfig (profile) {
  return toConfig(readIni()[profile] || {})
}

function readIni () {
  ensureIni()
  var credentials = ini.parse(fs.readFileSync(credentialsPath, 'utf-8'))
  var config = ini.parse(fs.readFileSync(configPath, 'utf-8'))
  return merge(config, credentials)
}

function toConfig(ini) {
  return R.zipObj(Object.keys(ini).map(stripAws).map(toCamel), R.values(ini))
}

function toIni(config) {
  return R.zipObj(Object.keys(config).map(toSnake).map(addAws), R.values(config))
}

var awsPre = /^aws_/
function stripAws (str) {
  return str.replace(awsPre, '')
}

var requirePrefix = ['access_key_id', 'secret_access_key']
function addAws (str) {
  if (requirePrefix.indexOf(str) >= 0) {
    return 'aws_' + str
  } else {
    return str
  }
}

function ensureIni () {
  if (fs.existsSync(configDir)) {
    return
  }

  fs.mkdirSync(configDir)
  touch.sync(credentialsPath)
  touch.sync(configPath)
}

function merge (a, b) {
  var keys = R.union(Object.keys(a), Object.keys(b))
  return R.zipObj(keys, keys.map(function (key) {
    return R.merge(a[key], b[key])
  }))
}
