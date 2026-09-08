const express = require('express');
const { logger } = require('../../utils');

const { checaSaldo, sacaCrypto } = require('../../services');

const router = express.Router();

/**
 * @openapi
 * /v1/saques:
 *  get:
 *    description: Retorna a lista de todos os saques realizados pelo usuário autenticado
 *    security:
 *      - auth: []
 *    responses:
 *      200:
 *        description: Lista de saques do usuário
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sucesso:
 *                  type: boolean
 *                  example: true
 *                message:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Saque'
 *
 *    tags:
 *      - Operações
 */
router.get('/', (req, res) => {
    res.json({
        sucesso: true,
        message: req.user.saques,
    });
});

/**
 * @openapi
 * /v1/saques:
 *  post:
 *    description: Realiza o saque de um valor em reais (BRL) da conta do usuário autenticado
 *    security:
 *      - auth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SaqueRequest'
 *    responses:
 *      200:
 *        description: Saque realizado com sucesso
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sucesso:
 *                  type: boolean
 *                  example: true
 *                saldo:
 *                  type: number
 *                  example: 800
 *                saques:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Saque'
 *      422:
 *        description: Saldo insuficiente
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/RespostaErro'
 *
 *    tags:
 *      - Operações
 */
router.post('/', async(req, res) => {
    const usuario = req.user;

    try {
        const valor = req.body.valor;
        const saldo = await checaSaldo(usuario);

        if (saldo < valor) {
            throw new Error('Você não possui saldo o suficiente para sacar esse dinheiro.');
        };

        usuario.saques.push({ valor : valor , data : new Date() });

        const saldoEmMoedas = await UsuarioSchema.moedas.find(m => m.codigo === 'BRL');
        saldoEmMoedas.quantidade -= valor;
        
        await usuario.save();
        res.json({ 
            sucesso: true,
            saldo: saldo - valor,
            saques: usuario.saques,
        });
    } catch (e) {
        logger.error(`Erro ao processar saque: ${e}`);

        res.status(422).json({
            sucesso: false,
            message: e.message,
        });
    }
});

/**
 * @openapi
 * /v1/saques/{codigo}:
 *  post:
 *    description: Realiza o saque de uma determinada cryptomoeda da carteira do usuário autenticado
 *    security:
 *      - auth: []
 *    parameters:
 *      - in: path
 *        name: codigo
 *        required: true
 *        schema:
 *          type: string
 *          example: BTC
 *        description: Código da moeda que você quer sacar (ex.: BTC, ETH)
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SaqueCryptoRequest'
 *    responses:
 *      200:
 *        description: Saque de crypto realizado com sucesso
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
 *        description: Saldo insuficiente ou moeda inválida
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/RespostaErro'
 *
 *    tags:
 *      - Operações
 */

router.post('/:codigo', async(req, res) => {
    const usuario = req.user;
    const codigo = req.params.codigo;

    try{
        const valor = req.body.valor;
        const moedas = await sacaCrypto(usuario, codigo, valor);

        res.json({
            sucesso: true,
            moedas: moedas
        });

    } catch (e){
        logger.error(`Erro no saque de crypto: ${e.message}`);

        res.status(422).json({
            sucesso: false,
            message: e.message,
        });
    }
});

module.exports = router;