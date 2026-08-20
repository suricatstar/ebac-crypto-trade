const { error } = require("winston");
const { Usuario } = require("../models");

const sacaCrypto = async (usuario, codigo, valor) => {
    // updateOne: atualiza apenas o primeiro documento que corresponder ao filtro.
    // Recebe dois argumentos: (filtro, atualização)
    const chamadaDeAtualizacao = await Usuario.updateOne(
        // 1º argumento: FILTRO — define QUAL documento será atualizado
        {
            id: usuario._id,
            moedas: {
                // $elemMatch: procura dentro de um array um elemento que satisfaça
                // TODAS as condições ao mesmo tempo (código correto E saldo suficiente).
                // Sem ele, as condições seriam verificadas separadamente (em elementos diferentes).
                $elemMatch: {
                    codigo: codigo,
                    quantidade: {
                        // $gte (greater than or equal): verifica se quantidade >= valor
                        // Garante que o usuário tem saldo suficiente antes de sacar
                        $gte: valor,
                    },
                },
            },
        },
        // 2º argumento: ATUALIZAÇÃO — o que será modificado no documento encontrado
        {
            // $inc: incrementa (ou decrementa) o valor de um campo numérico.
            // Usando -valor para subtrair a quantidade sacada.
            $inc: {
                // "moedas.$.quantidade": o $ (positional operator) referencia
                // exatamente o elemento do array que casou com o $elemMatch no filtro.
                // Sem o $, não saberíamos qual item do array 'moedas' atualizar.
                "moedas.$.quantidade": -valor,
            },
        },
    );

    // matchedCount: quantos documentos o filtro encontrou.
    // Se for 0, significa que o usuário não existe ou não tem saldo suficiente.
    if (chamadaDeAtualizacao.matchedCount === 0) {
        throw new Error('Você não possui saldo para sacar esse valor!');
    }

    // Retorna a lista de moedas atualizada do usuário
    return (await Usuario.findOne({ id: usuario._id })).moedas;
};

module.exports = { sacaCrypto };
