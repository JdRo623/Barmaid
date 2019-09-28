const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for veeduria
const producto = Schema({
    consecutivo : String,
    consecutivo_bar : String,
    precio: String,
    descripcion: String,
    cantidadInventario: String,
    cantidadVendidas: String
    }
)

module.exports = mongoose.model('productos', producto);