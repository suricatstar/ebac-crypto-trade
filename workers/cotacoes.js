const {Cotacao} = require('../models');
const { buscaCotacoesOnline } = require('../services');
const { logger } = require('../utils');

const cotacoesWorker = async (_job, done) => {
    logger.info('Buscando cotações...');

    const cotacoes = await buscaCotacoesOnline();

    logger.info('Cotações requisitadas com sucesso...');

    await Cotacao.insertMany(cotacoes);

    done();
}

module.exports = { cotacoesWorker };