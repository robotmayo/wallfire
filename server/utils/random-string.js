var Promise = require('bluebird');
var randomBytes = Promise.promisify(require('crypto').randomBytes);

function randomString(bytes){
  return randomBytes(bytes || 4).then(function(buf){
    return buf.toString('hex');
  });
}
module.exports = randomString;