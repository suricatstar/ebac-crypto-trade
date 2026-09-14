const { Usuario } = require('../models');
const { verificaLucro } = require('../services/verifica-lucro');
const { enviaEmailDeParabenizacao } = require('../services/envia-email');
const { logger } = require('../utils');

const parabenizacaoWorker = async (_, done) => {
    try {
        logger.info('Verificando usuários com lucro > R$1.000,00...');

        let temMaisUsuarios = true;
        let skip = 0;

        while (temMaisUsuarios) {
            const usuarios = await Usuario.find().skip(skip).limit(10);

            if (!usuarios.length) {
                temMaisUsuarios = false;
                break;
            }

            for (const usuario of usuarios) {
                const lucro = await verificaLucro(usuario);

                if (lucro !== null) {
                    logger.info(`Enviando parabéns para ${usuario.email} — lucro: R$${lucro}`);
                    await enviaEmailDeParabenizacao(usuario, lucro);
                }
            }

            skip += 10;
        }

        logger.info('Emails de parabenização enviados com sucesso.');
        done();
    } catch (err) {
        logger.error(`Erro no worker de parabenização: ${err.message}`);
        done(err);
    }
};

module.exports = { parabenizacaoWorker };
