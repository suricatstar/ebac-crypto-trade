const express = require('express');
const { logger } = require('../../utils');
const { logaUsuario } = require('../../services');

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

        res.status(401).json({
            sucesso: false,
            mensagem: 'Email ou senha inválidos',
        });
    }
});

module.exports = router;