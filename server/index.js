var Hapi = require('hapi');
var server = new Hapi.Server();
var through = require('through2');
var Path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var phash = require('phash-image');
var DB = require('./db');
var config = require('./config');
var saveAndValidate = require('./save-validate');
var uploadImageToStore = require('./upload-image-to-store');
var saveImageToDb = require('./save-image-to-db');
server.connection({port : 3000});

server.register(require('vision'), function(err){
  if(err) throw err;
  server.views({
    engines : {hbs : require('handlebars')},
    path : require('path').join(__dirname, '..', 'views')
  })
});

server.route({
  method : 'GET',
  path : '/',
  handler : function(request, reply){
    reply.view('index');
  }
});

server.route({
  method : 'GET',
  path : '/wallpaper/{id}',
  handler : function(request, reply){
    DB.query('SELECT uploaded_by, path, date_uploaded, id, name FROM images WHERE id = ?', request.params.id, function(err, results){
      if(err) throw err;
      reply.view('wallpaper', {data : results[0]});
    })
  }
})

server.route({
  method : 'POST',
  path : '/upload',
  config : {
    payload : {
      maxBytes : 8388608,
      output : 'stream',
      parse : true
    }
  },
  handler : function(request, reply){
    saveAndValidate({imageStream : request.payload.imageupload, uploadName : request.payload.imagename, contentType : request.payload.imageupload.hapi.headers['content-type']})
    .then(uploadImageToStore)
    .then(saveImageToDb)
    .then(function(data){
      reply.redirect('/wallpaper/'+ data.id);
    })
    .catch(function(e){
      console.log(e.stack)
    })
  }
});


server.start(function(){
  console.log('Server running at : ', server.info.uri);
})