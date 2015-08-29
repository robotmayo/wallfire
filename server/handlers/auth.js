const User = require('../models/user');

const login = {
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
      });

    }else{
      reply.view('login');
    }
  }
};

const logout = {
  method :'GET',
  path : '/logout',
  handler : function(request, reply){
    request.auth.session.clear();
    reply.redirect('/');
  }
};

const postRegister = {
  method : 'POST',
  path : '/register',
  handler : function(request, reply){
    User.validate({
      username : request.payload.username,
      password : request.payload.password
    })
    .then(User.create)
    .catch(function(err){
      console.log("AGFWEGE");
      if(err.message === 'ER_DUP_ENTRY') return reply('username already exists');
      return reply('internal server error');
    })
    .then(function(results){
      console.log(results);
      reply('Registerd!');
    })
    .catch(function(err){
      return reply('internal server error');
    });
  }
};

const getRegister = {
  method : 'GET',
  path : '/register',
  handler : function(request, reply){
    reply.view('register');
  }
};

module.exports.routes = [logout, postRegister,getRegister, login];