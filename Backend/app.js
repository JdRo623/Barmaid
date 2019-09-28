'use strict';

const mongoose = require('mongoose');
var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
module.exports = app; // for testing
var cors = require('cors');
var config = {
  appRoot: __dirname // required config
};
var interceptor = require('express-interceptor');
module.exports = app; // for testing
var keyczar = require('keyczarjs');

/*app.use(interceptor(function(req,res){
  return {
    isInterceptable: function(){
      return true;
    },
    intercept: function(body, done) {
      res.set('Content-Type', 'application/json');
      var keys = {
        meta: '{\"name\":\"\",\"purpose\":\"DECRYPT_AND_ENCRYPT\",\"type\":\"AES\",\"versions\":[{\"exportable\":false,\"status\":\"PRIMARY\",\"versionNumber\":1}],\"encrypted\":false}',
        1: '{\"aesKeyString\":\"bk6yaO25sNMpE5EugUt3YA\",\"hmacKey\":{\"hmacKeyString\":\"1BqpH90Bw631dJTcVwNGiAs4YiKExtkpsBbDbg8x2pA\",\"size\":256},\"mode\":\"CBC\",\"size\":128}'
    };
    var keyset = keyczar.fromJson(JSON.stringify(keys));
    body = keyset.encrypt(body);
      done(JSON.stringify({respuesta: body}));
    }
  };
}));*/


mongoose.connect('mongodb+srv://Barmaid:Barmaid.2019@clusterbarmaid-2bbiv.mongodb.net/test?retryWrites=true&w=majority')

  .then(() => console.log('MongoDB conectado...'))
  .catch(err => console.log(err))

SwaggerExpress.create(config, function(err, swaggerExpress) {

  if (err) { throw err; }
app.use(cors());
  // install middleware
  swaggerExpress.register(app);
  var port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});
