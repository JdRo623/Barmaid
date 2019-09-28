'use strict';

var util = require('util');
const boom = require('boom')
const Miembro = require('../../models/miembro.model')
const Organizacion = require('../../models/organizacion.model')
var https = require('https');
var keyczar = require('keyczarjs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
var qr = require('qr-image'); 

module.exports = {
    registarUsuario: registarUsuario,
  };

function registarUsuario (req, res) {
    try{
    var saveOrganizacion = async(req,res)=>{
        try{
            var reqDecrypt = (decrypt(req.body.data))
            //var reqDecrypt = ((req.body))
            var idOrganizacion = dayForID.call();
            var pendienteValor = 'Pendiente';
            reqDecrypt.idOrganizacion = idOrganizacion;
            reqDecrypt.estado = pendienteValor;
            reqDecrypt.fechaRegistro = getFechaActual.call();
            reqDecrypt.fechaAprobacion = pendienteValor;
            
            var organizacion = new Organizacion(reqDecrypt);
                return organizacion.save((err, organizacion) => {
                    if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign ({})});
                    if(!organizacion) return res.status(200).send({ estado: 'Error',message: 'Error al guardar la Organización', data: Object.assign ({})})
                    var JSONMiembros = reqDecrypt.miembros;
                    for (var item in JSONMiembros){
                        JSONMiembros[item].idOrganizacion = idOrganizacion;
                        JSONMiembros[item].nitOrganizacion = reqDecrypt.nit;
                    }

                    Miembro.insertMany(JSONMiembros,(err, miembroG) => {
                        if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign ({"error": err})});
                        if(!miembroG) return res.status(200).send({ estado: 'Error',message: 'No fue posible registrar la Organización', data: Object.assign ({})});
                        /*for(var miembro in miembroG){
                            createQR(organizacion,miembroG[miembro])
                        } */
                        return res.status(200).send({
                                    estado: 'Registrado',
                                    message: util.format("Organización registrada exitosamente"),
                                    data: Object.assign(organizacion)
                                });  
                        }); 
                    });
            }catch (err) {
                throw boom.boomify(err)
            }
        }
        saveOrganizacion(req,res);
    } catch (err){
        res.json(err);
        throw boom.boomify(err)
    }
}

function dayForID(){
    var today = new Date();
    var dd = today.getDate();
    var ss = today.getSeconds()+1; 
    var yyyy = today.getFullYear();
    var random1 =  Math.floor((Math.random() * 99) + 1);
    var random3 =  Math.floor((Math.random() * 99) + 1);
    var random2 =  Math.floor((Math.random() * 9) + 1);
    if(dd<10) dd='0'+dd;
    return yyyy+''+random3+''+dd+''+random1+'-'+(ss*random2);
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

function decrypt(text){
    var keys = {
      meta: '{\"name\":\"\",\"purpose\":\"DECRYPT_AND_ENCRYPT\",\"type\":\"AES\",\"versions\":[{\"exportable\":false,\"status\":\"PRIMARY\",\"versionNumber\":1}],\"encrypted\":false}',
      1: '{\"aesKeyString\":\"bk6yaO25sNMpE5EugUt3YA\",\"hmacKey\":{\"hmacKeyString\":\"1BqpH90Bw631dJTcVwNGiAs4YiKExtkpsBbDbg8x2pA\",\"size\":256},\"mode\":\"CBC\",\"size\":128}'
  };
    var keyset = keyczar.fromJson(JSON.stringify(keys));
    var textDecrypt = (keyset.decrypt(text));
    return JSON.parse(textDecrypt);
}