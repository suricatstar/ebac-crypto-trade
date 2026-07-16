const { gerarTopMovers } = require('../services');
const { logger } = require('../utils');

const topMoversWorker = async (job, done) => {
    try {
        logger.info(
            `Gerando Top Movers... Tentativa ${job.attemptsMade + 1}/${job.opts.attempts}`
        );

        await gerarTopMovers();

        logger.info('Top Movers gerado com sucesso.');

        done();
    } catch (err) {
        logger.error(`Erro ao processar o job: ${err.message}`);
        done(err);
    }
};

module.exports = { topMoversWorker };