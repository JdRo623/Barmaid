const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for veeduria
const bar = Schema({
    consecutivo : String,
    nit : String,
    nombre: String,
    direccion : String,
    telefono : String,
    logo : String,
    coordenadas: String,
    fotos: [String],
    etiquetas: [String],
    estado: String,
    calificacion: String,
    horario_atencion:String
    }
)

module.exports = mongoose.model('bares', bar);