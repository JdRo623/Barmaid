const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for veeduria
const usuario = Schema({
    numeroDocumento : String,
    nombre : String,
    apodo : String,
    contrasena : String,
    apellidos : String,
    celular : String,
    email : String,
    fechaNacimiento : String,
    fechaRegistro : String,
    estadoCuenta : String,
    fotoPerfil: String,
    baresFavoritos: [String]

    }
)

module.exports = mongoose.model('usuarios', usuario);