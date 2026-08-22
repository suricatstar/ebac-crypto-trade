const express = require('express');

const { TopClients } = require('../../models');
const { logger } = require('../../utils');

const router = express.Router();

// GET /top-clients?dia=YYYY-MM-DD
router.get('/', async (req, res) => {
    try {
        const { dia } = req.query;

        if (!dia) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Parâmetro "dia" é obrigatório. Formato esperado: YYYY-MM-DD',
            });
        }

        // monta range do dia inteiro: 00:00:00 até 23:59:59
        const inicioDia = new Date(dia);
        inicioDia.setUTCHours(0, 0, 0, 0);

        const fimDia = new Date(dia);
        fimDia.setUTCHours(23, 59, 59, 999);

        const topClients = await TopClients.findOne({
            dia: { $gte: inicioDia, $lte: fimDia },
        })
            .populate('gainers.usuario', 'nome email')
            .populate('loosers.usuario', 'nome email');

        if (!topClients) {
            return res.status(404).json({
                sucesso: false,
                erro: `Nenhum ranking encontrado para o dia ${dia}`,
            });
        }

        res.json({
            sucesso: true,
            dia: topClients.dia,
            gainers: topClients.gainers,
            loosers: topClients.loosers,
        });

    } catch (e) {
        logger.error(`Erro ao buscar top clients: ${e.message}`);

        res.status(500).json({
            sucesso: false,
            erro: e.message,
        });
    }
});

module.exports = router;
