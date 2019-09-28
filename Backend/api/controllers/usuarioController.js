'use strict';

var util = require('util');
const boom = require('boom')
const Usuario = require('../../models/usuario.model')

module.exports = {
    obtenerDetallesUsuario: obtenerDetallesUsuario,
  //  recuperarContrasena: recuperarContrasena,
  };