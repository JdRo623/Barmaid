const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for veeduria
const reserva = Schema({
    consecutivo : String,
    consecutivo_bar : String,
    numero_documento_usuario: String,
    fecha_realziacion_reserva : String,
    fecha_reserva : String,
    valor_reserva : String,
    descripcion: String,
    estado: String,
    }
)

module.exports = mongoose.model('reservas', reserva);