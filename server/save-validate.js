var mime = require('./utils/mime');
var fs = require('fs');
var crypto = require('crypto');
var getExt = require('./get-ext');
var Path = require('path');
/**
* Save and validate the file
* @param data
* @param data.imageStream
* @param data.uploadName
* @param data.contentType
**/
module.exports = function saveAndValidate(data){
  var uploadError;
  var fname = crypto.randomBytes(8).toString('hex');
  var ext = getExt(data.contentType);
  var file = Path.join(__dirname, '../tmpimgs', fname+ ext);
  return new Promise(function(resolve, reject){
    data.imageStream
    .pipe(mime())
    .on('error', function(err){
      if(!uploadError) uploadError = err; // We only care about the first error
    })
    .pipe(fs.createWriteStream(file))
    .on('close', function(){
      if(uploadError) return reject(uploadError);
      return resolve({filePath : file, fileName : fname, fileExt : ext, uploadName : data.uploadName});
    });
  });
}