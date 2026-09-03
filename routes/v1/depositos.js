const express = require('express');

const { logger } = require('../../utils');

const { checaSaldo, cancelaDeposito } = require('../../services');

const router = express.Router();

/**
 * @openapi
 * /v1/depositos:
 *  get:
 *    description: Retorna a lista de todos os depósitos realizados pelo usuário autenticado
 *    security:
 *      - auth: []
 *    responses:
 *      200:
 *        description: Lista de depósitos do usuário
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sucesso:
 *                  type: boolean
 *                  example: true
 *                depositos:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      valor:
 *                        type: number
 *                        example: 500
 *                      data:
 *                        type: string
 *                        format: date-time
 *                        example: "2024-01-15T10:30:00.000Z"
 *                      cancelado:
 *                        type: boolean
 *                        example: false
 *
 *    tags:
 *      - Operações
 */
router.get('/', (req, res) => {
    res.json({
        sucesso: true,
        depositos: req.user.depositos,
    });
});

/**
 * @openapi
 * /v1/depositos:
 *  post:
 *    description: Deposita um valor em reais (BRL) na conta do usuário autenticado. O valor mínimo é R$ 100,00
 *    security:
 *      - auth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - valor
 *            properties:
 *              valor:
 *                type: number
 *                minimum: 100
 *                example: 500
 *                description: Valor em reais a ser depositado (mínimo R$ 100)
 *    responses:
 *      200:
 *        description: Depósito realizado com sucesso
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sucesso:
 *                  type: boolean
 *                  example: true
 *                mensagem:
 *                  type: string
 *                  example: Depósito realizado com sucesso!
 *                saldo:
 *                  type: number
 *                  example: 1500
 *                depositos:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      valor:
 *                        type: number
 *                        example: 500
 *                      data:
 *                        type: string
 *                        format: date-time
 *                        example: "2024-01-15T10:30:00.000Z"
 *                      cancelado:
 *                        type: boolean
 *                        example: false
 *      422:
 *        description: Erro de validação
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sucesso:
 *                  type: boolean
 *                  example: false
 *                mensagem:
 *                  type: string
 *                  example: Valor mínimo de depósito é R$ 100,00.
 *
 *    tags:
 *      - Operações
 */
router.post('/', async (req, res) => {
    const usuario = req.user;

    try {
        const valor = req.body.valor;
        usuario.depositos.push({ valor: valor, data: new Date() });

        const saldoEmMoedas = await usuario.moedas.find(m => m.codigo === 'BRL');
        if (saldoEmMoedas) {
            saldoEmMoedas.quantidade += valor;
        } else {
            usuario.moedas.push({ codigo: 'BRL', quantidade: valor});
        }

        await usuario.save();

        res.json({
            sucesso: true,
            mensagem: 'Depósito realizado com sucesso!',
            saldo: await checaSaldo(usuario),
            depositos: usuario.depositos,
        });
    } catch (e) {
        logger.error(`erro no depósito: ${e.message}`);

        res.status(422).json({
            sucesso: false,
            mensagem: e.message,
        });
    }
});

/**
 * @openapi
 * /v1/depositos/{depositoId}:
 *  delete:
 *    description: Cancela um depósito existente pelo seu ID
 *    security:
 *      - auth: []
 *    parameters:
 *      - in: path
 *        name: depositoId
 *        required: true
 *        schema:
 *          type: string
 *          example: "507f1f77bcf86cd799439011"
 *        description: ID do depósito a ser cancelado
 *    responses:
 *      200:
 *        description: Depósito cancelado com sucesso
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sucesso:
 *                  type: boolean
 *                  example: true
 *                mensagem:
 *                  type: string
 *                  example: Depósito cancelado com sucesso!
 *                saldo:
 *                  type: number
 *                  example: 1000
 *                deposito:
 *                  type: object
 *                  properties:
 *                    valor:
 *                      type: number
 *                      example: 500
 *                    data:
 *                      type: string
 *                      format: date-time
 *                      example: "2024-01-15T10:30:00.000Z"
 *                    cancelado:
 *                      type: boolean
 *                      example: true
 *      422:
 *        description: Depósito não encontrado ou já cancelado
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sucesso:
 *                  type: boolean
 *                  example: false
 *                mensagem:
 *                  type: string
 *                  example: Depósito não encontrado.
 *
 *    tags:
 *      - Operações
 */
router.delete('/:depositoId', async (req, res) => {
    const usuario = req.user;
    const { depositoId } = req.params;

    try {
        const resultado = await cancelaDeposito(usuario, depositoId);
        
        res.json({
            sucesso: true,
            mensagem: resultado.mensagem,
            saldo: await checaSaldo(usuario),
            deposito: resultado.deposito
        });
    } catch (e) {
        logger.error(`Erro ao cancelar depósito: ${e.message}`);

        res.status(422).json({
            sucesso: false,
            mensagem: e.message,
        });
    }
});

module.exports = router;