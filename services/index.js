const { checaSaldo } = require("./checa-saldo");
const { criaUsuario } = require("./cria-usuario");
const { logaUsuario } = require("./loga-usuario");
const { cancelaDeposito } = require("./cancela-deposito");
const { buscaCotacoes } = require("./busca-cotacoes");

module.exports = {
  criaUsuario,
  logaUsuario,
  checaSaldo,
  buscaCotacoes,
  cancelaDeposito,
};
