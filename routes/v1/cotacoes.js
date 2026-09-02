const express = require('express');

const { buscaCotacoesNoBanco } = require('../../services');
const { logger } = require('../../utils');

const router = express.Router();

/**
 * @openapi
 * /v1/cotacoes:
 *  get:
 *    description: Retorna a última cotação de cada válida de cada moeda no nosso sistema
 *    responses:
 *      200:
 *        description: Recebe uma lista de cotações, atente-se ao id de cada cotação que será usado depois na troca de moedas
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sucesso:
 *                  type: boolean
 *                  example: true
 *                cotacoes:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Cotação'
 * 
 *      tags:
 *        - Operações
 */

router.get('/', async (_req, res) => {
    try {
        const cotacoes = await buscaCotacoesNoBanco();
        res.json({
            sucesso: true,
            cotacoes,
        });
    } catch (e) {
        logger.error(`Erro ao buscar cotações: ${e.message}`);

        res.status(500).json({ 
            sucesso: false, 
            mensagem: e.message,
         });
    }
});

module.exports = router;