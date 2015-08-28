var through = require('through2');
var fileType = require('file-type');
module.exports = function mime(data){
  return fileType(data);
}