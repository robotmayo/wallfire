var DB = require('./db');
var xtend = require('xtend');

function addNewTag(tagdata){
  return validate(tagdata)
  .then(function(){
    return DB.query('INSERT INTO tags SET tag_name = ?', tagdata.tagName.toLowerCase().trim())
  })
  .then(function(){
    return DB.query('SELECT id, tag_name FROM tags WHERE tag_name = ?', tagdata.tagName.toLowerCase().trim());
  })
  .then(function(results){
    return results[0][0];
  });
}
module.exports.addNewTag = addNewTag;

function validate(tagdata){
  if(tagdata.tagName.indexOf(' ') > -1 || tagdata.tagName.match(/\W+/) !== null) return Promise.reject(new Error('INVALID TAG NAME'));
  return DB.query('SELECT id FROM tags WHERE tag_name = ?', tagdata.tagName.toLowerCase().trim())
  .then(function(results){
    return results[0].length === 0 ? true : Promise.reject('TAG ALREADY EXISTS');
  })
}
module.exports.validate = validate;

function addTagToImage(data){
  return checkImageForTag({imageId : data.imageId, tagName : data.tagName})
  .then(function(){
    return DB.query('INSERT INTO image_tags SET ?')
  })
}