const express = require('express');

const { logger } = require('../../utils');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        sucesso: true,
        depositos: req.user.depositos,
    });
});

router.post('/', async (req, res) => {
    const usuario = req.user;

    try {
        const valor = req.body.valor;
        usuario.depositos.push({ valor: valor, data: new Date() });
        await usuario.save();
        res.json({
            sucesso: true,
            mensagem: 'Depósito realizado com sucesso!',
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

module.exports = router;