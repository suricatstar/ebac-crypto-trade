const nodemailer = require('nodemailer');
const ejs = require('ejs');
const jsonWebToken = require('jsonwebtoken');
const { Usuario } = require('../models');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false
});

const enviaEmailDeConfirmacao = async (usuario, urlDeRedirecionamento) => {
    const parametros = {
        nome: usuario.nome,
        linkDeConfirmacao: `${process.env.URL_DA_CRYPTOTRADE}/v1/auth/confirma-conta?token=${usuario.tokenDeConfirmacao}&redirect=${urlDeRedirecionamento}`
    };

    await transporter.sendMail({
        from:'"CryptoTrade" <noreply@cryptotrade.com.br>',
        to: usuario.email,
        subject: 'Confirmação de conta!',
        text: await ejs.renderFile('emails/confirmação/template.txt', parametros),
        html: await ejs.renderFile('emails/confirmação/template.html', parametros),
    })

};

const enviaEmailDeRecuperacao = async (email, urlDeRedirecionamento) => {
    if(!urlDeRedirecionamento){
        throw new Error('Deve ser enviado um parâmetro com url de redirecionamento no campo redirect');
    }

    if(!email){
        throw new Error('Deve ser enviado um parâmetro com o email no campo email para a recuperação de senha');
    }

    const usuario = await Usuario.findOne({ email });

    if(usuario){
        const token = jsonWebToken.sign(
           { token: usuario.tokenDeRecuperacao },
           process.env.JWT_SECRET,
           { expiresIn: '5 minutes '}
           
        );

        const parametros = {
            nome: usuario.nome,
            linkDeConfirmacao: `${process.env.URL_DA_CRYPTOTRADE}/v1/auth/valida-token?token=${token}&redirect=${urlDeRedirecionamento}`
        }

        await transporter.sendMail({
            from: '"CryptoTrade" <noreply@cryptotrade.com.br>',
            to: usuario.email,
            subject: 'pedido de recuperação de senha',
            text: await ejs.renderFile('emails/recuperacao-de-senha/template.txt', parametros),
            html: await ejs.renderFile('emails/recuperacao-de-senha/template.html', parametros),
        })
    }

};

module.exports = { enviaEmailDeConfirmacao, enviaEmailDeRecuperacao };