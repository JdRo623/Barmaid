const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for veeduria
const archivos = Schema({
    idOrganizacion : String,
    tipoArchivo : String,
    bytes : String,
    fechaRegistro : String,
    }
)

module.exports = mongoose.model('archivos', archivos);