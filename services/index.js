const { checaSaldo } = require("./checa-saldo");
const { criaUsuario } = require("./cria-usuario");
const { logaUsuario } = require("./loga-usuario");
const { cancelaDeposito } = require("./cancela-deposito");
const { buscaCotacoesOnline } = require("./busca-cotacoes");
const { buscaCotacoesNoBanco } = require("./busca-cotacoes");
const { gerarTopMovers } = require("./top-movers");
const { trocaMoedas } = require("./troca-moedas.js")

module.exports = {
  criaUsuario,
  logaUsuario,
  checaSaldo,
  buscaCotacoesOnline,
  buscaCotacoesNoBanco,
  cancelaDeposito,
  gerarTopMovers,
  trocaMoedas
};
