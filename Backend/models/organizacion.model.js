const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for veeduria
const organizacion = Schema({
    idOrganizacion : String,
    estado: String,
    fechaRegistro : String,
    fechaAprobacion : String,
    ambitoGeografico : String,
    nit : String,
    razonSocial : String,
    direccion : String,
    telefono : String,
    correoElectronico : String,
    paginaWeb : String,
    documentoRepresentanteLegal: String,
    representanteLegal : String,
    id_agente_aprobacion : String,
    etapas : [String],
    tiposArchivo:  [String]
    }
)

module.exports = mongoose.model('organizaciones', organizacion);