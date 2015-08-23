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
var User = require('./user');
server.connection({port : 3000});

server.register(require('vision'), function(err){
  if(err) throw err;
  server.views({
    engines : {hbs : require('handlebars')},
    path : require('path').join(__dirname, '..', 'views'),
    isCached : false
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
    DB.query('SELECT uploaded_by, path, date_uploaded, id, name FROM images WHERE id = ?', request.params.id)
    .then(function(results){
      reply.view('wallpaper', {data : results[0][0]}) 
    })
  }
});

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

server.route({
  method : 'POST',
  path : '/register',
  handler : function(request, reply){
    User.validate({
      username : request.payload.username,
      password : request.payload.password
    })
    .then(User.create)
    .catch(function(err){
      if(err.message === 'ER_DUP_ENTRY') return reply('username already exists');
      return reply('internal server error');
    })
    .then(function(results){
      console.log(results);
      reply('Registerd!')
    })
    .catch(function(err){
      return reply('internal server error');
    })
  }
});

server.route({
  method : 'GET',
  path : '/register',
  handler : function(request, reply){
    reply.view('register');
  }
})


server.start(function(){
  console.log('Server running at : ', server.info.uri);
})