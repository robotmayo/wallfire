var DB = require('./db');

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
  return checkImageForTag({imageId : data.imageId, tagId : data.tagId})
  .then(function(exists){
    console.log(exists)
    if(exists) return Promise.reject(new Error('Tag already exists'));
    return DB.query('INSERT INTO image_tags SET ?',
      {
        tag_id : data.tagId,
        wallpaper_id : data.imageId,
        added_by : data.username,
        added_on : new Date()
      })
  });
}
module.exports.addTagToImage = addTagToImage;

function checkImageForTag(data){
  return DB.query('SELECT COUNT(*) FROM image_tags WHERE wallpaper_id = ? AND tag_id = ?', [data.imageId, data.tagId])
  .then(function(results){
    return results[0].length > 0;
  })
}
module.exports.checkImageForTag = checkImageForTag;