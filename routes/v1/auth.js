const express = require('express');
const { logger } = require('../../utils');
const { logaUsuario, confirmaConta, enviaEmailDeConfirmacao } = require('../../services');

const router = express.Router();

/**
 * @openapi
 * /v1/auth:
 *  post:
 *    description: Rota que efetua o login e retorna um jwt
 *    requestBody: 
 *      description: Suas Informações de login
 *      required: true
 *      content: 
 *        application/json:
 *          schema: 
 *            type: object
 *            properties: 
 *              email: 
 *                type: string
 *              senha: 
 *                type: string
 *    responses:
 *      200:
 *        description: Request realizado com sucesso e jwt obtido
 *      401:
 *        description: Email ou senha inválidos
 *
 *    tags:
 *      - Autenticação
 */

router.get('/', async(req, res) => {
    try {
        const { email, senha } = req.body;

        const jwt = await logaUsuario(email, senha);

        res.status(200).json({
            sucesso: true,
            jwt: jwt,
        });

    } catch (e) {
        logger.error(`Erro ao autenticar usuário: ${e.message}`);

        if(e.message.match('confirmado')){
            res.status(401).json({
                sucesso: false,
                erro: e.message
            })
        }else{
            res.status(401).json({
                sucesso: false,
                mensagem: 'Email ou senha inválidos',
            });
        }
    }
});

router.get('/confirma-conta', async(req, res) => {
    try {
        const { token, redirect } = req.query;

        await confirmaConta(token);

        res.redirect(redirect);
        
    } catch (e) {
        logger.error(`Erro ao confirmar conta: ${e.message}`);
        res.status(422).json({
            sucesso: false,
            mensagem: e.message,
        });
    }
});

router.get('/pede-recuperacao', async(req,res) =>{
    try {
        const { email, redirect } = req.query;

        await enviaEmailDeRecuperacao(email, redirect);

        res.status(200).json({
            sucesso: true,
            mensagem: 'Se você possui um cadastro você receberá o email',
        });

    } catch (e) {

        logger.error(`Erro ao pedir recuperação: ${e.message}`);
        
        res.status(422).json({
            sucesso: false,
            mensagem: e.message,
        });
    }
});

module.exports = router;