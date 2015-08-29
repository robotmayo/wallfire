var Hapi = require('hapi');
var server = new Hapi.Server();
var DB = require('./db');
server.connection({port : 3000});

server.register(require('vision'), function(err){
  if(err) throw err;
  server.views({
    engines : {hbs : require('handlebars')},
    path : require('path').join(__dirname, '..', 'views'),
    isCached : false
  });
});

server.register(require('hapi-auth-cookie'), function(err){
  if(err) throw err;
  server.auth.strategy('session', 'cookie',{
    password : 'secret',
    cookie : 'sesh',
    redirectTo : '/login',
    isSecure : false
  });
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
      reply.view('wallpaper', {data : results[0][0]});
    });
  }
});

server.route(require('./handlers'));




server.start(function(){
  console.log('Server running at : ', server.info.uri);
});