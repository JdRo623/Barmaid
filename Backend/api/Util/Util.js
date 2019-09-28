//var keyczar = require('./keyczar');

   module.exports = {
    cifrar: cifrar,
    decifrar: decifrar,
    constructor: constructor,
  };
   
   var keys;
   var instance;

    function constructor() {
        this.keys = {
            meta: '{\"name\":\"\",\"purpose\":\"DECRYPT_AND_ENCRYPT\",\"type\":\"AES\",\"versions\":[{\"exportable\":false,\"status\":\"PRIMARY\",\"versionNumber\":1}],\"encrypted\":false}',
            1: '{\"aesKeyString\":\"bk6yaO25sNMpE5EugUt3YA\",\"hmacKey\":{\"hmacKeyString\":\"1BqpH90Bw631dJTcVwNGiAs4YiKExtkpsBbDbg8x2pA\",\"size\":256},\"mode\":\"CBC\",\"size\":128}'
        };
        this.instance = keyczar.fromJson(JSON.stringify(this.keys));
    }

    function cifrar(text) {
        constructor.call();
        return this.instance.encrypt(text);
    }

    function decifrar(text) {
        constructor.call();

        try {
          return this.instance.decrypt(text);
        } catch (error) {
          return text;
        }
    }
