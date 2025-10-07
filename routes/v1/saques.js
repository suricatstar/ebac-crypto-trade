const express = require('express');
const { logger } = require('../../utils');

const { checaSaldo } = require('../../services');

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

module.exports = router;