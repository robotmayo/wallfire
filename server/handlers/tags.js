var Tags = require('../models/tags');
const addTag = {
  method : 'POST',
  path : '/add-tag',
  handler : function(request, reply){
    Tags.addTagToImage(request.payload)
    .then(function(){
      reply('tag added!');
    })
    .catch(function(err){
      console.log(err);
      reply({error : true, message : err.message});
    });
  }
};

const getAllTagsFromImage = {
  method : 'GET',
  path : '/tags/{image_id}',
  handler : function(request, reply){
    Tags.getAllTagsFromImage({imageId  : request.params.image_id})
    .then(function(tags){
      reply(tags);
    })
    .catch(x => {console.error(x); reply(x);});
  }
};

module.exports.routes = [addTag, getAllTagsFromImage];