var mime = require('../utils/mime');
var randomString = require('../utils/random-string');
var uploadImageToStore = require('../upload-image-to-store');
var saveImageToDb = require('../save-image-to-db');
function uploadHandlerFn(request, reply){
  var ftype = mime(request.payload.imageupload._data.slice(0, 12)); // check the first few bytes to see if its an image
  if(ftype === null || ['jpg', 'png'].indexOf(ftype.ext) === -1) return reply('invalid file type')
  randomString()
  .then(function(str){
    return {
      imageName : str,
      uploadName : request.payload.uploadname,
      stream : request.payload.imageupload
    };
  })
  .then(uploadImageToStore)
  .then(saveImageToDb)
  .then(function(data){
    reply.redirect('/wallpaper/'+ data.id);
  })
  .catch(function(e){
    console.log(e.stack)
  })
}

module.exports = uploadHandlerFn;