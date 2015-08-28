var paws = require('./utils/paws');
var config = require('./config/config');
var xtend = require('xtend');
var mime = require('./utils/mime');
module.exports = function(data){
  return paws.S3.upload({
    Key : data.imageName,
    Body : data.stream,
    ACL : 'public-read',
    Bucket : config.aws.imagesBucket
  })
  .then(xtend.bind(null, {id : data.imageName, uploadName : data.uploadName}))
}