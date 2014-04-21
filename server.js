var fs = require('fs');
var path = require('path');
var argo = require('argo');
var mime = require('mime');
var lessMiddleware = require('less-middleware');
//var less = require('less');
//need to render .less code here somewhere?

argo()
  .use(function(handle) {
    var less = lessMiddleware(path.join(__dirname), null, { compress: true });

    handle('request', function(env, next) {
      env.request.path = env.request.url;
      less(env.request, env.response, function() { next(env); });
    });
  })
  .use(function(handle) {
    handle('response', function(env, next) {
      if (env.response.statusCode === 404) {
        env.response.body = 'Not Found';
      }
      next(env);
    });
  })
  .get('.+', function(handle) {
    handle('request', function(env, next) {
      if (env.request.url === '/' + __filename.split('/').pop() ||
          !!~env.request.url.indexOf('./')) {
        env.response.statusCode = 404;
        return next(env);
      }

      var filename = __dirname +
        (env.request.url === '/' ? '/start.html' : env.request.url)

      fs.stat(filename, function(err, stat) {
        if (err) {
          env.response.statusCode = 404;
          return next(env);
        }

        var stream = fs.createReadStream(filename);
        env.response.setHeader('Content-Type', mime.lookup(filename));
        env.response.body = stream;
        next(env);
      });
    });
  })
  .listen(process.env.PORT || 3001);
