var through = require('through2');
var fileType = require('file-type');
module.exports = function mime(){
  var checked = false;
  var type;
  return through(function(data, enc, cb){
    if(checked) {
      this.push(data);
      return cb();
    }
    type = fileType(data.slice(0, 12));
    if(type === null) {
      this.push(null);
      checked = true;
      return cb(new Error('INVALID_FILE_TYPE'))
    }
    if(type.ext === 'jpg' || type.ext === 'jpeg' || type.ext === 'png') checked = true;
    this.push(data);
    cb()
  })
}