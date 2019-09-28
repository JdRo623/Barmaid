'use strict';

var util = require('util');
const boom = require('boom')
const Usuario = require('../../models/usuario.model')

module.exports = {
    registarUsuario: registarUsuario,
    inicioSesion: inicioSesion,
  //  recuperarContrasena: recuperarContrasena,
  };

    function registarUsuario (req, res) {
    try{
    var registroUsuario = async(req,res)=>{
        try{
            //var reqDecrypt = (/*decrypt*/(req.body.data))
            var reqDecrypt = ((req.body))              
            var query_busqueda_usuario = {numero_documento: reqDecrypt.numero_documento,
                tipoDocumento:  reqDecrypt.tipoDocumento}

            Usuario.find(query_busqueda_usuario,(err, usuario) => {
                if(err)return res.status(500).send({cod_estado: '0', estado: 'Error',message: 'Error en la petición', data: Object.assign ({})});
                if(usuario.length!=0){
                    return res.status(200).send({ cod_estado: '1', estado: 'Error',message: 'Ya existe un usuario registrado con el numero de documento ingresado', data: Object.assign ({})});
                }else{
                    var query_busqueda_usuario = { email:  reqDecrypt.email}
                    Usuario.find(query_busqueda_usuario,(err, usuario) => {
                        if(err)return res.status(500).send({cod_estado: '0', estado: 'Error',message: 'Error en la petición', data: Object.assign ({})});
                        if(usuario.length!=0){
                            return res.status(200).send({ cod_estado: '2', estado: 'Error',message: 'Ya existe un usuario registrado con el correo electronico ingresado', data: Object.assign ({})});
                        }else{
                            var usuario = new Usuario(reqDecrypt)
                            return usuario.save((err, usuario) => {
                                if(err)return res.status(500).send({cod_estado: '0', estado: 'Error',message: 'Error en la petición', data: Object.assign ({})});
                                if(usuario.length==0) return res.status(200).send({ cod_estado: '3', estado: 'Error',message: 'Error al guardar el usuario', data: Object.assign ({})})
                                return res.status(200).send({
                                    cod_estado: '623',
                                    estado: 'Registrado',
                                    message: util.format("Usuario registrado exitosamente"),
                                    data: Object.assign(usuario)
                                });  
                            });
                        }
        
                    }); 
                    } 
                }); 
            }catch (err) {
                throw boom.boomify(err)
            }
        }
        registroUsuario(req,res);
    } catch (err){
        res.json(err);
        throw boom.boomify(err)
    }
}

    function inicioSesion (req, res) {
    try{
    var inicio = async(req,res)=>{
        try{
            //var reqDecrypt = (decrypt(req.body.data))
            var reqDecrypt = ((req.body))              
            var query_busqueda_usuario = {email : reqDecrypt.email}

            Usuario.find(query_busqueda_usuario,(err, usuario) => {
                
                if(err)return res.status(500).send({cod_estado: '0', estado: 'Error',message: 'Error en la petición', data: Object.assign ({})});
                console.log(usuario);
                if(usuario.length==0){
                    return res.status(200).send({ cod_estado: '1', estado: 'Error',message: 'El usuario no existe', data: Object.assign ({})});
                }else{
                    if(usuario[0].contrasena == reqDecrypt.contrasena){
                        return res.status(200).send({
                            cod_estado: '623',
                            estado: 'Identificado',
                            message: util.format("Usuario identificado correctamente"),
                            data: Object.assign(usuario)
                        });  
                    }else{
                        return res.status(200).send({
                            cod_estado: '2',
                            estado: 'No identificado',
                            message: util.format("Contraseña incorrecta"),
                            data: Object.assign ({})
                        }); 
                    }
                    } 
                }); 
            }catch (err) {
                throw boom.boomify(err)
            }
        } 
        inicio(req,res);
    } catch (err){
        res.json(err);
        throw boom.boomify(err)
    }
}