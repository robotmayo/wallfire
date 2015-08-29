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
module.exports.routes = [addTag];