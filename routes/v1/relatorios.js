const express = require('express');

const { gerarPnl } = require('../../services');
const { logger } = require('../../utils');

const router = express.Router();

router.get('pnl', async(req, res) => {
    try{
        const pnl = await gerarPnl(req.user);

        res.json({
            sucesso: true,
            pnl: pnl
        });
    } catch (e){
        logger.error(`Erro ao gerar PnL do usuário ${req.user.email}: ${e.message}`);
        
        res.status(500).json({
            sucesso: false,
            error: e.message
        });
    }
});

module.exports = router;