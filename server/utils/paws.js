var AWS = require('aws-sdk');
var Path = require('path');
var Promise = require('bluebird');
var fs = require('fs');
var tempFilePath = Path.join(__dirname, '../tmpimgs');
AWS.config.loadFromPath(Path.join(__dirname,'../config/aws.config.json'));
var S3 = new AWS.S3();
module.exports.S3 = {};
module.exports.S3.upload = function(params){
  return new Promise(function(resolve, reject){
    S3.upload(params, function(err, results){
      if(err) return reject(err);
      resolve(results);
    })
  })
}