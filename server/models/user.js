var DB = require('../db');
var PromisifyAll = require('bluebird').promisifyAll;
var bcrypt = PromisifyAll(require('bcrypt'));
var xtend = require('xtend');
var randomString = require('../utils/random-string');

function createUser(userdata){
  return bcrypt
  .genSaltAsync(10)
  .then(bcrypt.hashAsync.bind(bcrypt, userdata.password))
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
  if(userdata.password.length < 0) return Promise.reject(new Error('Password must be at least 8 characters'));
  return Promise.resolve(userdata);
}
module.exports.validate = validate;

function login(data){
  return validate(data)
  .then(getHashFromDB.bind(null, data.username))
  .then(bcrypt.compareAsync.bind(bcrypt, data.password))
  .then(function(result){
    if(result === false) return Promise.reject('Incorrect Information');
    return saveSession(data.username);
  })
  .catch(console.log);
}
module.exports.login = login;

function saveSession(username){
  return randomString(16)
  .then(function(sessionId){
    var ttl = Date.now() + 604800000;
    return DB.query(
      'INSERT INTO sessions SET ? ON DUPLICATE KEY UPDATE session_id = ?, ttl = ?', 
      [{session_id : sessionId, username : username, ttl : new Date(ttl)}, sessionId, new Date(ttl)])
    .then(function(){
      return {sessionId : sessionId, ttl : ttl, username : username};
    });
  });
}

function getHashFromDB(username){
  return DB.query('SELECT password FROM users WHERE username = ?', username)
  .then(function(results){
    console.log(results[0][0].password);
    if(results[0].length === 0) return Promise.reject(new Error('User does not exist'));
    return results[0][0].password;
  });
}
module.exports.getHashFromDB = getHashFromDB;