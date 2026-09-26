const { checaSaldo } = require('./checa-saldo');

/**
 * Realiza o saque de um valor em BRL da conta do usuario.
 *
 * @param {Object} usuario - Documento Mongoose do usuario autenticado.
 * @param {number} valor   - Valor em BRL a ser sacado.
 * @returns {{ saldo: number, saques: Array }} Saldo restante e lista de saques atualizada.
 * @throws {Error} Se o usuario nao possuir saldo suficiente ou se o valor for invalido.
 */
const sacaBrl = async (usuario, valor) => {
    if (!valor || valor <= 0) {
        throw new Error('O valor do saque deve ser maior que zero.');
    }

    const saldo = await checaSaldo(usuario);

    if (saldo < valor) {
        throw new Error('Saldo insuficiente para realizar o saque.');
    }

    // Registra o saque no historico do usuario
    usuario.saques.push({ valor, data: new Date() });

    // Desconta o valor da moeda BRL
    const moedaBrl = usuario.moedas.find((m) => m.codigo === 'BRL');
    if (moedaBrl) {
        moedaBrl.quantidade -= valor;
    }

    await usuario.save();

    return {
        saldo: saldo - valor,
        saques: usuario.saques,
    };
};

module.exports = { sacaBrl };
