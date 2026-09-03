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
 *            type: object
 *            required:
 *              - cotacaoId
 *              - quantidade
 *              - operacao
 *            properties:
 *              cotacaoId:
 *                type: string
 *                example: "507f1f77bcf86cd799439011"
 *                description: ID da cotação obtido em GET /v1/cotacoes
 *              quantidade:
 *                type: number
 *                example: 0.001
 *                description: Quantidade de crypto a comprar ou vender
 *              operacao:
 *                type: string
 *                enum:
 *                  - compra
 *                  - venda
 *                example: compra
 *                description: Tipo de operação — compra (BRL → crypto) ou venda (crypto → BRL)
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
 *                    type: object
 *                    properties:
 *                      codigo:
 *                        type: string
 *                        example: BTC
 *                      quantidade:
 *                        type: number
 *                        example: 0.001
 *      422:
 *        description: Saldo insuficiente ou cotação inválida
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sucesso:
 *                  type: boolean
 *                  example: false
 *                erro:
 *                  type: string
 *                  example: Saldo em BRL insuficiente para a operação.
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