'use strict';

var util = require('util');
const boom = require('boom')
const Archivo = require('../../models/archivo.model')
const Miembro = require('../../models/miembro.model')
const Organizacion = require('../../models/organizacion.model')
var https = require('https');
var keyczar = require('keyczarjs');


module.exports = {
    getAllOrganizaciones: getAllOrganizaciones,
    cambiarEstadoOrganizacion: cambiarEstadoOrganizacion,
    obtenerDetalleOrganizacion: obtenerDetalleOrganizacion,
  };

  function getAllOrganizaciones (req, res) {
    try{
        var reqDecrypt = (decrypt(req.body.data))
        var JSONFiltro ={};
        if(reqDecrypt.ambito_geografico) JSONFiltro.nivel_territorial = reqDecrypt.ambito_geografico;
        if(reqDecrypt.estado_aprobacion) JSONFiltro.estado_aprobacion = reqDecrypt.estado_aprobacion;
        Organizacion.countDocuments(JSONFiltro,(err, conteo_organizaciones) => {
            if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign ({})});
            if(!conteo_organizaciones) return res.status(200).send({ estado: 'Error',message: 'No hay Organizaciones', data: Object.assign ({})});
            Organizacion.find(JSONFiltro,(err, organizacion) => {
                if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign ({})});
                if(!organizacion) return res.status(200).send({ estado: 'Error',message: 'No hay Organizaciones', data: Object.assign ({})});
                var JSONOrganizacion = {total_organizaciones: conteo_organizaciones,
                    organizaciones: organizacion};
                return res.status(200).send({
                    estado: 'Aprobado',
                    message: util.format('Organizaciones obtenidas correctamente'),
                    data: Object.assign(JSONOrganizacion)
                });  
            }).skip(10*reqDecrypt.pagina).limit(reqDecrypt.cantidad);
        });  
    } catch (err){
        res.json(err);
        throw boom.boomify(err)
    }
}


function obtenerDetalleOrganizacion(req, res){
    var detalleOrganizacion = async(req,res)=>{
     //   console.info(utilitario.cifrar('Hola a todos'));
     var reqDecrypt = (decrypt(req.body.data))
        const id ={idOrganizacion: reqDecrypt.idOrganizacion};
        await Organizacion.find(id, (err, organizacion) => {
            if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign (id)});
            if(!organizacion) return res.status(200).send({ estado: 'Error',message: 'La organizacion no existe', data: Object.assign ({})});
           // const id_veeduria ={consecutivo_veeduria: reqDecrypt.consecutivo};
            Miembro.find(id, (err, miembro) => {
            if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign (id)});
            var respuesta = {}
            respuesta.informacion_organizacion = organizacion;
            respuesta.miembros = miembro;
            return res.status(200).send({
                estado: 'Aprobado',
                message: util.format('Organizacion Encontrada'),
                data: Object.assign(respuesta)
            });  
        });
        });
    }
    detalleOrganizacion(req,res)
}

function cambiarEstadoOrganizacion (req,res){
    try{
        var actualizarOrganizacion = async(req,res)=>{
            var reqDecrypt = (decrypt(req.body.data))

            const query ={idOrganizacion: reqDecrypt.idOrganizacion}
            
            const ToUpdate = { comentario: reqDecrypt.comentario,
                estado: reqDecrypt.estado_aprobacion,
                fechaAprobacion: getFechaActual.call(),
                id_agente_aprobacion: reqDecrypt.id_agente_vigilancia
            }

            await Miembro.find(query, (err, miembros) => {
                if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign (id)});
                if(!miembros) return res.status(200).send({ estado: 'Error',message: 'No se encontró la Organizacion', data: Object.assign (id)});
                for (var item in miembros){
                    createQR(reqDecrypt,miembros[item]);
                }
                Organizacion.findOneAndUpdate(query, ToUpdate, { new: true }, (err, organizacion) => {
                    if(err)return res.status(500).send({ estado: 'Error',message: 'Error en la petición', data: Object.assign (id)});
                    if(!organizacion) return res.status(200).send({ estado: 'Error',message: 'No se encontró la Organizacion', data: Object.assign (id)});
                    if(reqDecrypt.estado_aprobacion=='Aprobado'){
                        for (var item in miembros){
                            createPDF(organizacion,miembros[item]);
                        }
                    }
                    return res.status(200).send({
                        estado: 'Aprobado',
                        message: util.format('Organizacion actualizada correctamente'),
                        data: Object.assign(organizacion)
                });
              });  
            });
        }
        actualizarOrganizacion(req,res);
        
    } catch (err){
        res.json(err);
        throw boom.boomify(err)
    }
}

function createQR(organizacion,miembro){
    var crearQR = async(organizacion, miembro)=>{
    try{
        var directorio = 'C:/certificados/'+organizacion.idOrganizacion;
        if (!fs.existsSync(directorio)){
            fs.mkdirSync(directorio);
        }
        var JSONQR = {}
        JSONQR.idOrganizacion_organizacion = organizacion.idOrganizacion;
        JSONQR.numero_documento = miembro.cedula;
        var directorioImagen= directorio+'/qr'+organizacion.idOrganizacion+'_'+miembro.cedula+'.png';
        var qr_svg = qr.image(JSON.stringify(JSONQR), { type: 'png' });
        await qr_svg.pipe(require('fs').createWriteStream(directorioImagen));
    }catch (err){
        res.json(err);
        throw boom.boomify(err)
    }
}
crearQR(organizacion,miembro)   
}

function createPDF(organizacion, miembro){
    var crearPDF = async(organizacion, miembro)=>{
        try{

        const doc = new PDFDocument;
        var margen_izquierda = 70;
        var directorio = 'C:/certificados/'+Organizacion.idOrganizacion;
        if (!fs.existsSync(directorio)){
            fs.mkdirSync(directorio);
        }
        var directorioImagen= directorio+'/qr'+Organizacion.idOrganizacion+'_'+miembro.cedula+'.png';
       
        doc.pipe(fs.createWriteStream(directorio+'/Certificado_'+Organizacion.idOrganizacion+'_'+miembro.cedula+'.pdf'));
        doc.fontSize(25).text('Certificado de Organizacion Nacional', margen_izquierda, 100);
        doc.fontSize(20).text('Información de la organizacion', margen_izquierda, 150);
        doc.fontSize(15).text('Id de la Organizacion: '+organizacion.idOrganizacion, margen_izquierda, 170);
        doc.fontSize(15).text('NIT: '+ organizacion.nit, margen_izquierda, 190);
        doc.fontSize(15).text('Fecha de aprobación: '+organizacion.fecha_aprobacion, margen_izquierda, 210);
        /// INFO CIUDADANO
        doc.fontSize(20).text('Información del Miembro', margen_izquierda, 250);
        doc.fontSize(15).text('Numero de documento: '+miembro.cedula, margen_izquierda, 270);
        doc.fontSize(15).text('Nombres: '+ miembro.nombres, margen_izquierda, 290);
        doc.fontSize(15).text('Apellidos: '+miembro.apellidos, margen_izquierda, 310);
       
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
    crearPDF(organizacion,miembro)
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
