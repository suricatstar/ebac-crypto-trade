const express = require('express');

const { logger } = require('../../utils');

const { criaUsuario } = require('../../services/index');

const router = express.Router();

router.post('/', async  (req, res) => {
    const dados = req.body.usuario;

    try{
        const usuario = await criaUsuario(dados);

        res.json({
            sucesso: true,
            usuario: usuario
        })
    }
    catch(e){
        logger.error(`Erro ao criar usuário: ${e.message}`);
        res.status(422).json({
            sucesso: false,
            erros: e.message
        })
    }
})

module.exports = router;