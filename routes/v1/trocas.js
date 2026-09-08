const express = require('express');

const { trocaMoedas } = require('../../services');
const { logger } = require('../../utils')

const router = express.Router();


/**
 * @openapi
 * /v1/trocas:
 *  post:
 *    description: Realiza a compra ou venda de uma cryptomoeda. Use a operação "compra" para converter BRL em crypto, ou "venda" para converter crypto de volta em BRL
 *    security:
 *      - auth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/TrocaRequest'
 *    responses:
 *      200:
 *        description: Troca realizada com sucesso
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sucesso:
 *                  type: boolean
 *                  example: true
 *                moedas:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Moeda'
 *      422:
 *        description: Saldo insuficiente ou cotação inválida
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/RespostaErro'
 *
 *    tags:
 *      - Operações
 */
router.post('/', async(req, res) => {
    try{
        const moedas = await trocaMoedas(
            req.user,
            req.body.cotacaoId,
            req.body.quantidade,
            req.body.operacao,
        );

        res.json({
            sucesso:true,
            moedas:moedas
        });

    } catch (e){
        logger.error(`erro na troca de moedas: ${e.message}`);

        res.status(422).json({
            sucesso:false,
            erro: e.message
        })
    }
});

module.exports = router;