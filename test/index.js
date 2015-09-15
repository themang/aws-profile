var awsProfile = require('..')
var assert = require('assert')
var aws = require('aws-sdk')
var mkdirp = require('mkdirp')
var path = require('path')
var rmdir = require('rmdir')

var awsPath = path.join(__dirname, '.aws')

describe('aws-profile', function () {

  before(function () {
    awsProfile.setAWSDir(awsPath)
  })

  it('should add and then delete test profile', function() {
    var profile = 'test-profile'
    var accessKeyId = "foobarfoobar"

    var config = {
      accessKeyId: accessKeyId,
      secretAccessKey: "foobarfobar",
      region: 'us-west-2'
    }

    awsProfile.add(profile, config)
    var cred = new aws.SharedIniFileCredentials({profile: profile})
    assert(cred.accessKeyId, accessKeyId)

    var config2 = awsProfile.get(profile)
    assert.deepEqual(config2, config)

    awsProfile.login(profile)
    var config3 = awsProfile.get()
    assert.deepEqual(config3, config)


    awsProfile.delete(profile)
    awsProfile.delete('default')
    var config4 = awsProfile.get()
    assert.deepEqual(config4, {})
    var config5 = awsProfile.get(profile)
    assert.deepEqual(config5, {})
  })

  after(function (done) {
    rmdir(awsPath, function () {
      done()
    })
  })

})
