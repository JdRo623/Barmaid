const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for veeduria
const miembros = Schema({
    idOrganizacion : String,
    nitOrganizacion: String,
    cedula : String,
    nombres : String,
    apellidos : String,
    cargo : String,
    }
)

module.exports = mongoose.model('miembros', miembros);