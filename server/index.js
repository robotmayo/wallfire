var Hapi = require('hapi');
var server = new Hapi.Server();
var through = require('through2');
var Path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var phash = require('phash-image');
var DB = require('./db');
var config = require('./config/config');
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

server.register(require('hapi-auth-cookie'), function(err){
  if(err) throw err;
  server.auth.strategy('session', 'cookie',{
    password : 'secret',
    cookie : 'sesh',
    redirectTo : '/login',
    isSecure : false
  })
})

server.route({
  method : 'GET',
  path : '/',
  handler : function(request, reply){
    reply.view('index');
  }
});

server.route({
  method : ['GET', 'POST'],
  path : '/login',
  config : {
    auth : {
      mode : 'try',
      strategy : 'session'
    },
    plugins : {
      'hapi-auth-cookie' : {
        redirectTo : false
      }
    }
  },
  handler : function(request, reply){
    if(request.auth.isAuthenticated){
      return reply.redirect('/');
    }
    if(request.method.toUpperCase() === 'POST'){
      return User.login(request.payload)
      .then(function(sessionData){
        request.auth.session.set(sessionData);
        return reply.redirect('/');
      })

    }else{
      reply.view('login');
    }
  }
});

server.route({
  method :'GET',
  path : '/logout',
  handler : function(request, reply){
    request.auth.session.clear();
    reply.redirect('/')
  }
})

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
    },
    auth : 'session'
  },
  handler : require('./handlers/upload')
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
      console.log("AGFWEGE")
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
});




server.start(function(){
  console.log('Server running at : ', server.info.uri);
})