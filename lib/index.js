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

var config = {
  defaultProfile: 'default'
}

var profileKeys = ['accessKeyId', 'secretAccessKey', 'region']

setAWSDir(path.join(process.env.HOME, '.aws'))


exports.add = function (profile, opts) {
  profile = profile || defaultProfile
  writeConfig(profile, opts)
}

exports.get = function (profile) {
  profile = profile || config.defaultProfile
  return readConfig(profile)
}

exports.login = function (profile) {
  exports.add(config.defaultProfile, exports.get(profile))
}

exports.delete = function (profile) {
  if (!profile) {
    throw new Error('Must specify profile.')
  }
  writeConfig(profile, null)
}

exports.setAWSDir = setAWSDir

function setAWSDir(dir) {
  config.dir = dir
  config.credentials = path.join(dir, 'credentials')
  config.config = path.join(dir, 'config')
}

var credentials = ['aws_access_key_id', 'aws_secret_access_key']
function writeConfig (profile, opts) {
  var out = readIni()
  if (opts) {
    out[profile] = R.merge(out[profile], toIni(opts))
  } else {
    delete out[profile]
  }

  fs.writeFileSync(config.credentials, ini.stringify(R.mapObj(function(conf) {
    return R.pick(credentials, conf)
  }, out)))

  fs.writeFileSync(config.config, ini.stringify(R.mapObj(function(conf) {
    return R.omit(credentials, conf)
  }, out)))
}

function readConfig (profile) {
  return toConfig(readIni()[profile] || {})
}

function readIni () {
  ensureIni()
  var credentials = ini.parse(fs.readFileSync(config.credentials, 'utf-8'))
  var configOpts = ini.parse(fs.readFileSync(config.config, 'utf-8'))
  return merge(configOpts, credentials)
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
  if (fs.existsSync(config.dir)) {
    return
  }

  fs.mkdirSync(config.dir)
  touch.sync(config.credentials)
  touch.sync(config.config)
}

function merge (a, b) {
  var keys = R.union(Object.keys(a), Object.keys(b))
  return R.zipObj(keys, keys.map(function (key) {
    return R.merge(a[key], b[key])
  }))
}
