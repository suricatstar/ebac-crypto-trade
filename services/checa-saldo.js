const { Usuario } = require('../models');

// agreggetion pipeline

const checaSaldo = async (usuario) => {
    const operacoes = (await Usuario.aggregate([
        // $match: filtra os documentos — aqui busca o usuário pelo CPF
        { $match: { cpf: usuario.cpf } },

        // $unwind: "desempacota" o array 'moedas', transformando cada elemento
        // em um documento separado para poder processar individualmente.
        // preserveNullAndEmptyArrays: true → mantém o doc mesmo se 'moedas' for vazio/null
        {
            $unwind: {
                path: '$moedas',
                preserveNullAndEmptyArrays: true
            }
        },

        // $project: define quais campos vão aparecer no resultado (1 = inclui, 0 = exclui).
        // Aqui mantemos apenas 'moedas.quantidade' e 'moedas.codigo', descartando o resto.
        {
            $project: {
                'moedas.quantidade': 1,
                'moedas.codigo': 1,
            }
        },

        // $lookup: faz um JOIN com outra collection (como o JOIN do SQL).
        // from: nome da collection a unir ('cotacaos')
        // localField: campo deste documento usado na comparação ('moedas.codigo')
        // foreignField: campo da outra collection para comparar ('moeda')
        // as: nome do campo onde o resultado do JOIN será salvo (como array)
        {
            $lookup: {
                from: 'cotacaos',
                localField: 'moedas.codigo',
                foreignField: 'moeda',
                as: 'cotacoes'  // resultado do JOIN fica aqui como array
            }
        },

        // $project (2º): renomeia campos e pega a cotação mais recente.
        // quantidade/codigo: renomeia os campos de moedas para o nível raiz.
        // $sortArray: ordena o array 'cotacoes' por data decrescente (-1 = mais recente primeiro)
        // $first: pega apenas o primeiro elemento do array (a cotação mais atual)
        {
            $project: {
                quantidade: '$moedas.quantidade',
                codigo: '$moedas.codigo',
                cotacao: {
                    $first: {
                        $sortArray: { input: '$cotacoes', sortBy: { data: -1 } }
                    }
                }
            }
        },

        // $project (3º): calcula o valor total em BRL para cada moeda.
        // $multiply: multiplica quantidade × cotacao.valor (quantidade * preço atual)
        // $ifNull: se 'cotacao.valor' for null (ex: BRL sem cotação), usa 1 como fallback
        //          (evita que a multiplicação retorne null)
        {
            $project: {
                totalBrl: {
                    $multiply: ['$quantidade', { $ifNull: ['$cotacao.valor', 1] }],
                },
                codigo: 1
            }
        }

    ]));

    return operacoes.reduce((acc, operacao) => acc + operacao.totalBrl, 0);
};

module.exports = { checaSaldo };