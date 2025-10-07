const { checaSaldo } = require("./checa-saldo");
const { criaUsuario } = require("./cria-usuario");
const { logaUsuario } = require("./loga-usuario");
const { cancelaDeposito } = require("./cancela-deposito");

module.exports = {
  criaUsuario,
  logaUsuario,
  checaSaldo,
  cancelaDeposito,
};
