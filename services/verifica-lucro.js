const { gerarPnl } = require('./gerar-pnl');

const LIMITE_LUCRO = 1000;

/**
 * Verifica se o usuário teve mais de R$1.000,00 de lucro no dia anterior.
 * @param {Object} usuario - Documento do usuário do MongoDB
 * @returns {number|null} O valor do lucro se for maior que R$1.000,00, ou null caso contrário
 */
const verificaLucro = async (usuario) => {
    const pnl = await gerarPnl(usuario);

    if (pnl > LIMITE_LUCRO) {
        return pnl;
    }

    return null;
};

module.exports = { verificaLucro, LIMITE_LUCRO };
