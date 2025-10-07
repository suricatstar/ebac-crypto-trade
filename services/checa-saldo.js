const { Usuario } = require('../models');

// agreggetion pipeline

const checaSaldo = async (usuario) => {
    const operacoes = (await Usuario.aggregate([
        { $match: { cpf: usuario.cpf } },
        {
            $addFields: {
                depositosAtivos: {
                    $filter: {
                        input: "$depositos",
                        as: "deposito",
                        cond: { $ne: ["$$deposito.cancelado", true] }
                    }
                }
            }
        },
        {
            $unwind: {
                path: '$depositosAtivos',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group:{
                _id: "$_id",
                depositos: { $sum: "$depositosAtivos.valor" },
                saques: { $last: "$saques"}
            }
        },
        {
            $unwind: {
                path: '$saques',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group:{
                _id: "$_id",
                saques: { $sum: "$saques.valor" },
                depositos: { $last: "$depositos" }
            },
        }
    ]))[0];
    
    if (!operacoes) {
        return 0;
    }
    
    const totalDepositos = operacoes.depositos || 0;
    const totalSaques = operacoes.saques || 0;
    
    return totalDepositos - totalSaques;
};

module.exports = { checaSaldo };