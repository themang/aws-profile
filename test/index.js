var awsProfile = require('..')
var assert = require('assert')
var aws = require('aws-sdk')

describe('aws-profile', function () {

  it('should add and then delete test profile', function() {
    var profile = 'test-profile'
    var accessKeyId = "foobarfoobar"
    awsProfile.add(profile, {
      aws_access_key_id: accessKeyId,
      aws_secret_access_key: "foobarfobar"
    }, {
      region: 'us-west-2',
      output: 'json'
    })
    var cred = new aws.SharedIniFileCredentials({profile: profile})
    assert(cred.accessKeyId, accessKeyId)

    awsProfile.delete(profile)
    var cred = new aws.SharedIniFileCredentials({profile: profile})
    assert(cred.accessKeyId === undefined)
  })

})
