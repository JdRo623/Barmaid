const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for veeduria
const promocion = Schema({
    consecutivo : String,
    consecutivo_bar : String,
    valida_desde: String,
    valida_hasta : String,
    descripcion : String,
    baner : String,
    etiquetas: [String],
    estado: String,
    destacada: String,
    }
)

module.exports = mongoose.model('promociones', promocion);