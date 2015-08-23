var paws = require('./paws');
var fs = require('fs');
var config = require('./config');
var xtend = require('xtend');
module.exports = function(fileData){
  return paws.S3.upload({
    Key : fileData.fileName,
    Body : fs.createReadStream(fileData.filePath),
    ACL : 'public-read',
    Bucket : config.aws.imagesBucket
  })
  .then(xtend.bind(null, {id : fileData.fileName, uploadName : fileData.uploadName}))
}