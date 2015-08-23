var Promisify = require('bluebird').promisify;
var db = require('mysql').createPool(require('./config').database);
module.exports.DB = db;
module.exports.query = Promisify(db.query, db);