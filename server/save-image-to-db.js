var db = require('./db');
var xtend = require('xtend');
module.exports = function saveImageToDb(data){
  return db.query('INSERT INTO images SET ? ',{
    id : data.id,
    path : data.Location,
    name : data.uploadName,
    uploaded_by : 1
  })
  .then(function(){return xtend({}, data)});
}