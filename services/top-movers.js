const {Cotacao, TopMovers} = require('../models');

async function gerarTopMovers() {

    const hoje = new Date();

    const inicioHoje = new Date(hoje);
    inicioHoje.setHours(0,0,0,0);

    const inicioAmanha = new Date(inicioHoje);
    inicioAmanha.setDate(inicioAmanha.getDate() + 1);

    const inicioOntem = new Date(inicioHoje);
    inicioOntem.setDate(inicioOntem.getDate() - 1);

    const moedas = await Cotacao.distinct('moeda');

    const resultados = [];

    for (const moeda of moedas) {

        const cotacaoOntem = await Cotacao
            .findOne({
                moeda,
                data: {
                    $gte: inicioOntem,
                    $lt: inicioHoje
                }
            })
            .sort({ data: -1 });

        const cotacaoHoje = await Cotacao
            .findOne({
                moeda,
                data: {
                    $gte: inicioHoje,
                    $lt: inicioAmanha
                }
            })
            .sort({ data: -1 });

        if (!cotacaoOntem || !cotacaoHoje)
            continue;

        const variacao =
            ((cotacaoHoje.valor - cotacaoOntem.valor) / cotacaoOntem.valor) * 100;

        resultados.push({
            moeda,
            variacao
        });
    }

    resultados.sort((a, b) => b.variacao - a.variacao);

    const gainers = resultados.slice(0, 3);

    const loosers = [...resultados]
        .sort((a, b) => a.variacao - b.variacao)
        .slice(0, 3);

    await TopMovers.findOneAndUpdate(
        { dia: inicioHoje },
        {
            dia: inicioHoje,
            gainers,
            loosers
        },
        {
            upsert: true,
            new: true
        }
    );

    console.log('Top Movers atualizado.');
}

module.exports = {gerarTopMovers};