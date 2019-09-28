'use strict';

var util = require('util');
const boom = require('boom')
const Archivo = require('../../models/archivo.model')
var keyczar = require('keyczarjs');


module.exports = {
    guardarArchivo: guardarArchivo,
  };
  
  function guardarArchivo (req, res) {
    try{
    var saveArchivo = async(req,res)=>{
        try{
            var reqDecrypt = (decrypt(req.body.data))
            reqDecrypt.fechaRegistro = getFechaActual.call();

            
            var archivo = new Archivo(reqDecrypt);

            return archivo.save((err, archivo) => {
                    if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign ({})});
                    if(!archivo) return res.status(200).send({ estado: 'Error',message: 'Error al guardar el archivo', data: Object.assign ({})})
                    return res.status(200).send({
                        estado: 'Ingresado',
                        message: util.format("Archivo ingresado exitosamente"),
                        data: Object.assign({"estadoArchivo":"Aprobado"})
                        });  
                    });
            }catch (err) {
                throw boom.boomify(err)
            }
        }
        saveArchivo(req,res);
    } catch (err){
        res.json(err);
        throw boom.boomify(err)
    }
}
function decrypt(text){
    var keys = {
      meta: '{\"name\":\"\",\"purpose\":\"DECRYPT_AND_ENCRYPT\",\"type\":\"AES\",\"versions\":[{\"exportable\":false,\"status\":\"PRIMARY\",\"versionNumber\":1}],\"encrypted\":false}',
      1: '{\"aesKeyString\":\"bk6yaO25sNMpE5EugUt3YA\",\"hmacKey\":{\"hmacKeyString\":\"1BqpH90Bw631dJTcVwNGiAs4YiKExtkpsBbDbg8x2pA\",\"size\":256},\"mode\":\"CBC\",\"size\":128}'
  };
    var keyset = keyczar.fromJson(JSON.stringify(keys));
    var textDecrypt = (keyset.decrypt(text));
    return JSON.parse(textDecrypt);
}

function getFechaActual(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //As January is 0.
    var yyyy = today.getFullYear();
    var hour = today.getHours();
    var minu = today.getMinutes();
    var ss = today.getSeconds();
    if(dd<10) dd='0'+dd;
    if(mm<10) mm='0'+mm;
    if(minu<10) minu='0'+minu;
    if(ss<10) ss='0'+ss;
    if(hour<10) hour='0'+hour;

    return dd+'-'+mm+'-'+yyyy+' '+hour+':'+minu+':'+ss;
}