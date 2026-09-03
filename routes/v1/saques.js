const express = require('express');
const { logger } = require('../../utils');

const { checaSaldo, sacaCrypto } = require('../../services');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        sucesso: true,
        message: req.user.saques,
    });
});

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
 *    post:
 *      description: Realiza o saque de uma determinada cryptomoeda
 *      security: 
 *        - auth: []
 *      parameters:
 *          - in: path
 *            name: codigo
 *            schema:
 *              type: string
 *              example: BTC
 *            required: true
 *            description: Código da moeda que você quer sacar
 *     tags:
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