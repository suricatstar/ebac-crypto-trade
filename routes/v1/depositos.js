const express = require('express');

const { logger } = require('../../utils');

const { checaSaldo, cancelaDeposito } = require('../../services');

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

// Nova rota para cancelar depósito
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