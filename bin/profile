#!/usr/bin/env node

var program = require('commander')
var profile = require('..')
var prompt = require('sync-prompt').prompt;


program
  .command('add <name>')
  .description('Add a profile')
  .action(function(name) {
    var credentials = {
      aws_access_key_id: prompt('AWS Access Key ID [None]:'),
      aws_secret_access_key: prompt('AWS Secret Access Key [None]:')
    }
    var config = {
      region: prompt('Default region name [None]:'),
      output: prompt('Default output format [None]:')
    }
    profile.add(name, credentials, config)
  })

program
  .command('delete <name>')
  .description('Delete a profile')
  .action(function(name) {
    profile.delete(name)
  })

program.parse(process.argv)
