/*'use strict';

var util = require('util');
const boom = require('boom')
const utilitario = require('../Util/util')
const Archivo = require('../../models/archivo.model')
const Miembro = require('../../models/miembro.model')
const Organizacion = require('../../models/organizacion.model')
var https = require('https');
var keyczar = require('keyczarjs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
var qr = require('qr-image'); 

module.exports = {
    getAllVeedurias: getAllVeedurias,
    guardarVeeduria: guardarVeeduria,
    cambiarEstadoVeeduria: cambiarEstadoVeeduria,
    obtenerDetalleVeeduria:obtenerDetalleVeeduria,
  };

//Get todos los agentes
function getAllVeedurias (req, res) {
    try{
        var reqDecrypt = (decrypt(req.body.data))
        var JSONFiltro ={};
        if(reqDecrypt.nivel_territorial) JSONFiltro.nivel_territorial = reqDecrypt.nivel_territorial;
        if(reqDecrypt.estado_aprobacion) JSONFiltro.estado_aprobacion = reqDecrypt.estado_aprobacion;
        Veeduria.countDocuments(JSONFiltro,(err, veedurias) => {
            if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign ({})});
            if(!veedurias) return res.status(200).send({ estado: 'Error',message: 'No hay veedurias', data: Object.assign ({})});
            Veeduria.find(JSONFiltro,(err, veeduria) => {
                if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign ({})});
                if(!veeduria) return res.status(200).send({ estado: 'Error',message: 'No hay veedurias', data: Object.assign ({})});
                var JSONVeedurias = {total_veedurias: veedurias,
                    veedurias: veeduria};
                return res.status(200).send({
                    estado: 'Aprobado',
                    message: util.format('Veedurias obtenidas correctamente'),
                    data: Object.assign(JSONVeedurias)
                });  
            }).skip(10*reqDecrypt.pagina).limit(reqDecrypt.cantidad);
        });  
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

function obtenerDetalleVeeduria(req, res){
    var detalleVeeduria = async(req,res)=>{
     //   console.info(utilitario.cifrar('Hola a todos'));
     var reqDecrypt = (decrypt(req.body.data))
        const id ={consecutivo: reqDecrypt.consecutivo};
        await Veeduria.find(id, (err, veeduriaM) => {
            if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign (id)});
            if(!veeduriaM) return res.status(200).send({ estado: 'Error',message: 'No hay veedurias', data: Object.assign ({})});
            const id_veeduria ={consecutivo_veeduria: reqDecrypt.consecutivo};
            Ciudadano.find(id_veeduria, (err, ciudadanoM) => {
            if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign (id)});
            var respuesta = {}
            respuesta.informacion_veeduria = veeduriaM;
            respuesta.ciudadanos = ciudadanoM;
            return res.status(200).send({
                estado: 'Aprobado',
                message: util.format('Veeduria Encontrada'),
                data: Object.assign(respuesta)
            });  
        });
        });
    }
    detalleVeeduria(req,res)
}

function guardarOrganizacion (req, res) {
    try{
    var saveOrganizacion = async(req,res)=>{
        try{
            var reqDecrypt = (decrypt(req.body.data))
            var consecutivoValor = dayForID.call();
            //AgregarValidacion de consecutivo unico
            var pendienteValor = 'Pendiente';
          
            var JSONVeeduria = {consecutivo: consecutivoValor, 
            nivel_territorial: reqDecrypt.nivel_territorial,
            estado_aprobacion: pendienteValor,
            fecha_aprobacion: pendienteValor,
            comentario: pendienteValor,
            fecha_registro: getFechaActual.call(),
            id_agente_aprobacion: pendienteValor };

            
            var veeduria = new Veeduria(JSONVeeduria);
                return veeduria.save((err, resultado) => {
                    if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign ({})});
                    if(!resultado) return res.status(200).send({ estado: 'Error',message: 'Error al guardar la veeduria', data: Object.assign ({})})
                    var JSONCIudadanos = reqDecrypt.ciudadanos;
                    for (var item in JSONCIudadanos){
                        JSONCIudadanos[item].consecutivo_veeduria = consecutivoValor;
                    }
                    Ciudadano.insertMany(JSONCIudadanos,(err, ciudadanoG) => {
                        if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign ({})});
                        if(!ciudadanoG) return res.status(200).send({ estado: 'Error',message: 'No fue posible registrar la veeduría', data: Object.assign ({})});
                        for(var ciudadano in ciudadanoG){
                            createQR(resultado,ciudadanoG[ciudadano])
                        } 
                        return res.status(200).send({
                                    estado: 'Registrado',
                                    message: util.format("Veeduria registrada exitosamente"),
                                    data: Object.assign(resultado)
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

function cambiarEstadoVeeduria (req,res){
    try{
        var actualizarVeeduria = async(req,res)=>{
            var reqDecrypt = (decrypt(req.body.data))

            const id ={consecutivo: reqDecrypt.consecutivo}
            const query_ciudadano ={consecutivo_veeduria: reqDecrypt.consecutivo}

            const veeduria = reqDecrypt
           // var estadoToken = validarToken.call(reqDecrypt.token)
            
            const ToUpdate = { comentario: veeduria.comentario,
                estado_aprobacion: veeduria.estado_aprobacion,
                fecha_aprobacion: getFechaActual.call(),
                id_agente_aprobacion: veeduria.id_agente_vigilancia
            }
            await Ciudadano.find(query_ciudadano, (err, ciudadanos) => {
                if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign (id)});
                if(!ciudadanos) return res.status(200).send({ estado: 'Error',message: 'No se encontró la veeduria', data: Object.assign (id)});
                for (var item in ciudadanos){
                    createQR(veeduria,ciudadanos[item]);
                }
                Veeduria.findOneAndUpdate(id, ToUpdate, { new: true }, (err, veeduriaM) => {
                    if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign (id)});
                    if(!veeduriaM) return res.status(200).send({ estado: 'Error',message: 'No se encontró la veeduria', data: Object.assign (id)});
                    if(veeduria.estado_aprobacion=='Aprobado'){
                        for (var item in ciudadanos){
                            createPDF(veeduriaM,ciudadanos[item]);
                        }
                    }
                    return res.status(200).send({
                        estado: 'Aprobado',
                        message: util.format('Veedurias actualizada correctamente'),
                        data: Object.assign(veeduriaM)
                });
                
              });  
            });
        }
        actualizarVeeduria(req,res);
        
    } catch (err){
        res.json(err);
        throw boom.boomify(err)
    }

function validarToken(token) {
    var jsonObject = JSON.stringify({
        "token" : token,
    });
    var postheaders = {
        'Content-Type' : 'application/json',
        'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
    };
    var optionspost = {
        host : 'localhost',
        port : 10010,
        path : '/swagger',
        method : 'POST',
        headers : postheaders
    };
    console.info('Options prepared:');
    console.info(optionspost);
    console.info('Do the POST call');

    var reqPost = https.request(optionspost, function(res) {
        console.log("statusCode: ", res.statusCode);
        // uncomment it for header details
    //  console.log("headers: ", res.headers);
     
        res.on('data', function(d) {
            console.info('POST result:\n');
            process.stdout.write(d);
            console.info('\n\nPOST completed');
        });
    });
     
    // write the json data
    reqPost.write(jsonObject);
    reqPost.end();
    console.info(jsonObject);
    reqPost.on('error', function(e) {
        console.error(e);
    });

}
function ejecutarServicioExterno(){
    Request.post({
        "headers": { "content-type": "application/json" },
        "url": "172.19.98.134:10011/validarToken",
        "body": JSON.stringify({
            "token": req.body.token
        })
    }, (error, response, body) => {
        if(error) {
           return console.dir(error);
        }
        var estadoToken = body;
    });
    }
}
function createQR(veeduria,ciudadano){
        var crearQR = async(veeduria, ciudadano)=>{
        try{
            var directorio = 'C:/certificados/'+veeduria.consecutivo;
            if (!fs.existsSync(directorio)){
                fs.mkdirSync(directorio);
            }
            var JSONQR = {}
            JSONQR.consecutivo_veeduria = veeduria.consecutivo;
            JSONQR.numero_documento = ciudadano.numero_documento;
            var directorioImagen= directorio+'/qr'+veeduria.consecutivo+'_'+ciudadano.numero_documento+'.png';
            var qr_svg = qr.image(JSON.stringify(JSONQR), { type: 'png' });
            await qr_svg.pipe(require('fs').createWriteStream(directorioImagen));
        }catch (err){
            res.json(err);
            throw boom.boomify(err)
        }
    }
    crearQR(veeduria,ciudadano)   
}
function createPDF(veeduria, ciudadano){
    var crearPDF = async(veeduria, ciudadano)=>{
        try{

        const doc = new PDFDocument;
        var margen_izquierda = 70;
        var directorio = 'C:/certificados/'+veeduria.consecutivo;
        if (!fs.existsSync(directorio)){
            fs.mkdirSync(directorio);
        }
        var directorioImagen= directorio+'/qr'+veeduria.consecutivo+'_'+ciudadano.numero_documento+'.png';
       
        doc.pipe(fs.createWriteStream(directorio+'/Certificado_'+veeduria.consecutivo+'_'+ciudadano.numero_documento+'.pdf'));
        doc.fontSize(25).text('Certificado de Veeduria Nacional', margen_izquierda, 100);
        doc.fontSize(20).text('Información de la Veeduria', margen_izquierda, 150);
        doc.fontSize(15).text('Consecutivo: '+veeduria.consecutivo, margen_izquierda, 170);
        doc.fontSize(15).text('Nivel territorial: '+ veeduria.nivel_territorial, margen_izquierda, 190);
        doc.fontSize(15).text('Fecha de aprobación: '+veeduria.fecha_aprobacion, margen_izquierda, 210);
        /// INFO CIUDADANO
        doc.fontSize(20).text('Información del Ciudadano', margen_izquierda, 250);
        doc.fontSize(15).text('Numero de documento: '+ciudadano.numero_documento, margen_izquierda, 270);
        doc.fontSize(15).text('Nombres: '+ ciudadano.nombres, margen_izquierda, 290);
        doc.fontSize(15).text('Apellidos: '+ciudadano.apellidos, margen_izquierda, 310);
        doc.fontSize(15).text('Direccion de residencia: '+ciudadano.direccion_residencia, margen_izquierda, 330);
        doc.fontSize(15).text('Correo electronico: '+ciudadano.correo_electronico, margen_izquierda, 350);
       
        doc.image(directorioImagen, {
            fit: [400, 400],
            align: 'center',
            valign: 'center'
         });
        
        
        return doc.end();
    }catch (err){
        res.json(err);
        throw boom.boomify(err)
    }
    }
    crearPDF(veeduria,ciudadano)
}*/