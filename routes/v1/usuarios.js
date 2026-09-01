const express = require('express');

const passport = require('passport');

const { logger } = require('../../utils');

const { criaUsuario, checaSaldo } = require('../../services/index');

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

/**
 * @openapi
 * /v1/usuarios/me:
 *  get:
 *    description: Retorna o perfil do usuário logado
 *    security: 
 *      - auth: []
 *    responses:
 *      200:
 * 
 *        description: informações do Perfil do usuário
 *      401:
 *          description: autorização está faltando ou está invalida
 * 
 *      tags:
 *        - Usuário
 */

router.get('/me', passport.authenticate('jwt', {session: false}), async(req, res) => {
    res.json({
        sucesso: true,
        usuario: req.user,
        saldo: await checaSaldo(req.user)
    });
});

module.exports = router;