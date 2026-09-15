const { Relatorio } = require('../models');

const gerarPnl = async (usuario) => {

    const agora = new Date();

    // Início de ontem às 00:00:00.000 — garante que o relatório das 00h de ontem
    // seja sempre incluído, independentemente do horário em que a função for chamada
    const inicioDeOntem = new Date(
        agora.getFullYear(),
        agora.getMonth(),
        agora.getDate() - 1,
        0, 0, 0, 0
    );

    const relatorios = await Relatorio.aggregate([
        {
            $match:{
                usuarioId: usuario._id,
                data: { $gte: inicioDeOntem }
            }
        },
        { $sort: { data: -1 }}
    ]);
    if(relatorios.length === 0){
        return 0;
    };

    if(relatorios.length === 1 ){
        return relatorios[0].saldo;
    }

    return relatorios[0].saldo - relatorios[1].saldo;
};

module.exports = { gerarPnl };
