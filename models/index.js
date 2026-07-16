const mongoose = require('mongoose');

const UsuarioSchema = require('./usuario');

const CotacaoSchema = require('./cotacao');

const TopMoversSchema = require('./GainersLoosers');

const Usuario = mongoose.model('Usuario', UsuarioSchema.UsuarioSchema);
const Cotacao = mongoose.model('Cotacao', CotacaoSchema);
const TopMovers = mongoose.model('TopMovers', TopMoversSchema);

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URL);
}

module.exports = {
  connect,
  Usuario,
  Cotacao,
  TopMovers
}
