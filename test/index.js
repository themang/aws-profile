var awsProfile = require('..')
var assert = require('assert')
var aws = require('aws-sdk')

describe('aws-profile', function () {

  it('should add and then delete test profile', function() {
    var profile = 'test-profile'
    var accessKeyId = "foobarfoobar"

    var config = {
      accessKeyId: accessKeyId,
      secretAccessKey: "foobarfobar",
      region: 'us-west-2',
      output: 'json'
    }

    awsProfile.add(profile, config)
    var cred = new aws.SharedIniFileCredentials({profile: profile})
    assert(cred.accessKeyId, accessKeyId)

    var config2 = awsProfile.get(profile)
    assert.deepEqual(config2, config)

    awsProfile.load(profile)
    assert(aws.config.region === config.region)

    awsProfile.delete(profile)
    var cred = new aws.SharedIniFileCredentials({profile: profile})
    assert(cred.accessKeyId === undefined)
  })

})
