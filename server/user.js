var DB = require('./db');
var PromisifyAll = require('bluebird').promisifyAll;
var bcrypt = PromisifyAll(require('bcrypt'));
var xtend = require('xtend');

function createUser(userdata){
  return bcrypt
  .genSaltAsync(10)
  .then(bcrypt.hashAsync.bind(null, 'cock'))
  .then(function(hashedPassword){
    return DB.query('INSERT INTO users SET ?', {
      username : userdata.username,
      password : hashedPassword
    });
  });
}
module.exports.create = createUser;

function validate(userdata){
  var userdata = xtend({}, userdata);
  if(userdata.username.indexOf(' ') > -1 || userdata.username.match(/\W+/) !== null) return Promise.reject(new Error('USERNAME NAME MUST NOT CONTAIN SPACES'));
  if(userdata.password === '') return Promise.reject(new Error('Password must not be blank'));
  return Promise.resolve(userdata);
}
module.exports.validate = validate;