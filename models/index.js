const mongoose = require('mongoose');

const { UsuarioSchema } = require('./usuario');

const CotacaoSchema = require('./cotacao');

const TopMoversSchema = require('./GainersLoosers');

const CorretoraSchema = require('./coretora');

const Usuario = mongoose.model('Usuario', UsuarioSchema);
const Cotacao = mongoose.model('Cotacao', CotacaoSchema);
const TopMovers = mongoose.model('TopMovers', TopMoversSchema);
const Corretora = mongoose.model('Corretora', CorretoraSchema);

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URL);
}

module.exports = {
  connect,
  Usuario,
  Cotacao,
  TopMovers,
  Corretora
}
