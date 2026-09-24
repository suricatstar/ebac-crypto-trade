const express = require('express');

const passport = require('passport');

const bcrypt = require('bcrypt');

const { logger } = require('../../utils');


const { criaUsuario, checaSaldo, gerarSegredo } = require('../../services/index');

const router = express.Router();

router.post('/', async  (req, res) => {
    const dados = req.body.usuario;
    const urlDeRedirecionamento = req.body.redirect;

    if(!urlDeRedirecionamento){
        return res.status(422).json({
            sucesso: false,
            erro: 'Deve passar um parâmetro redirect para onde o usuário será redirecionado pós confirmação'
        })
    }

    try{
        const usuario = await criaUsuario(dados, urlDeRedirecionamento);

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

router.put('/senha', 
    passport.authenticate('jwt', {session: false}),
    async(req, res) => {
    const { senha } = req.body
    try {
        const usuario = req.user;
        usuario.senha = await bcrypt.hash(senha, 10);
        await usuario.save();

        res.status(200).json({
            sucesso: true,
            mensagem: 'Senha alterada com sucesso',
        })

    } catch (e) {
        logger.error(`Erro ao alterar senha: ${e.message}`);
        res.status(422).json({
            sucesso: false,
            erro: e.message,
        });
    }
});

/**
 * @openapi
 * /v1/usuario/otp:
 *  post:
 *    description: Gera um segredo TOTP para o usuário autenticado, essa rota irá associar um novo OTP ao usuário!
 *    security: 
 *      - auth: []
 *    responses:
 *      200:
 *        description: Gera um novo OTP qrcode para o usuário autenticado!
 *        content: 
 *          image/svg+xml:
 *            schema:
 *              type: string
 *              example: <svg>...</svg>
 *      401:
 *          description: autorização está faltando ou está invalida
 * 
 *      tags:
 *        - autenticacao
 */

router.post('/otp', passport.authenticate('jwt', {session: false}), 
    async(req, res) => {

        const usuario = req.user;

        try{
            const { segredo, qrcode } = gerarSegredo(usuario.email);

            usuario.segredoOtp = segredo;

            await usuario.save();

            return res.send(qrcode);
            
        }
        catch(e){
            logger.error(`Erro na geração do segredo TOTP ${e.message}`);

            res.status(500).json({
                sucesso: false,
                erro: e.message,
            });
            
        }

});

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