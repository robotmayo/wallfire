var Hapi = require('hapi');
var server = new Hapi.Server();
var through = require('through2');
var fileType = require('file-type');
var Path = require('path');
var AWS = require('aws-sdk');
var crypto = require('crypto');
var fs = require('fs');
var phash = require('phash-image');
var DB = require('./db');
var config = require('./config');
var tempFilePath = Path.join(__dirname, '../tmpimgs');
AWS.config.loadFromPath(Path.join(__dirname,'./aws.config.json'));
var S3 = new AWS.S3();
server.connection({port : 3000});

server.register(require('vision'), function(err){
  if(err) throw err;
  console.log('vision plugin loaded');
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
    console.log(request.params)
    DB.query('SELECT uploaded_by, path, date_uploaded, id FROM images WHERE id = ?', request.params.id, function(err, results){
      if(err) throw err;
      console.log(results);
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
    var erroredOut = false;
    var uploadError;
    var fname = crypto.randomBytes(8).toString('hex');
    var file = Path.join(__dirname, '../tmpimgs', fname+ getExt(request.payload.imageupload.hapi.headers['content-type']));
    request.payload.imageupload
    .pipe(mime())
    .on('error', function(err){
      if(!erroredOut) {
        console.log(err);
        uploadError = err;
        erroredOut = true;
      }
    })
    .pipe(fs.createWriteStream(file))
    .on('close', function(){
      if(erroredOut){
        if(uploadError.messge = 'INVALID_FILE_TYPE') return reply('Invalid file type');
        return reply('Server error :( Please try again');
      }
      S3.upload({
        Bucket : config.aws.imagesBucket,
        ACL : 'public-read',
        Key : file.split('/').slice(-1)[0],
        Body : fs.createReadStream(file)
      }, function(err, results){
        if(err) throw err;
        fs.unlink(file, function(err){if(err) throw err})
        DB.query('INSERT INTO images SET ?', {
          id : fname,
          uploaded_by : 1,
          path : results.Location,
          name : request.payload.imagename
        }, function(err, results){
          if(err) throw err;
          reply.redirect('/wallpaper/'+fname)
        })
      })
    })
  }
});

function getExt(header){
  if(header.indexOf('jpeg') > -1 || header.indexOf('jpg') > -1 ) return '.jpg';
  if(header.indexOf('png') > -1 ) return '.png';
  return '';
}

function mime(){
  var checked = false;
  var type;
  return through(function(data, enc, cb){
    if(checked) {
      this.push(data);
      return cb();
    }
    type = fileType(data.slice(0, 12));
    if(type === null) {
      this.push(null);
      checked = true;
      return cb(new Error('INVALID_FILE_TYPE'))
    }
    if(type.ext === 'jpg' || type.ext === 'jpeg' || type.ext === 'png') checked = true;
    this.push(data);
    cb()
  })
}

server.start(function(){
  console.log('Server running at : ', server.info.uri);
})