const { checaSaldo } = require("./checa-saldo");
const { criaUsuario } = require("./cria-usuario");
const { logaUsuario } = require("./loga-usuario");
const { cancelaDeposito } = require("./cancela-deposito");
const { buscaCotacoesOnline } = require("./busca-cotacoes");
const { buscaCotacoesNoBanco } = require("./busca-cotacoes");
const { gerarTopMovers } = require("./top-movers");
const { gerarPnl } = require('./gerar-pnl');
const { trocaMoedas } = require("./troca-moedas");
const { sacaCrypto } = require("./saca-crypto");
const { sacaBrl } = require("./saca-brl");
const { enviaEmailDeConfirmacao } = require('./envia-email');
const { confirmaConta } = require('./confirma-conta');
const { enviaEmailDeRecuperacao } = require('./envia-email');
const { validaTokenAlteracaoDeSenha } = require('./valida-token-senha.js');
const { verificaLucro } = require('./verifica-lucro');
const { enviaEmailDeParabenizacao } = require('./envia-email');
const { gerarSegredo, validarOtp } = require('./otp');

module.exports = {
  criaUsuario,
  logaUsuario,
  checaSaldo,
  buscaCotacoesOnline,
  buscaCotacoesNoBanco,
  cancelaDeposito,
  gerarTopMovers,
  trocaMoedas,
  sacaCrypto,
  sacaBrl,
  gerarPnl,
  enviaEmailDeConfirmacao,
  confirmaConta,
  enviaEmailDeRecuperacao,
  validaTokenAlteracaoDeSenha,
  verificaLucro,
  enviaEmailDeParabenizacao,
  gerarSegredo,
  validarOtp
};
