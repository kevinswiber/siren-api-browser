var fs = require('fs');
var argo = require('argo');
var mime = require('mime');

argo()
  .use(function(handle) {
    handle('response', function(env, next) {
      if (env.response.statusCode === 404) {
        env.response.body = 'Not Found';
      }
      next(env);
    });
  })
  .get('*', function(handle) {
    handle('request', function(env, next) {
      if (env.request.url === '/' + __filename.split('/').pop() ||
          !!~env.request.url.indexOf('./')) {
        env.response.statusCode = 404;
        return next(env);
      }

      var filename = __dirname +
        (env.request.url === '/' ? '/index.html' : env.request.url)

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
  .listen(3001);
