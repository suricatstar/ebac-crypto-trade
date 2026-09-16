const qrcode = require('qr-image');
const { authenticator } = require('otplib');

const gerarSegredo = (email) => {
    const segredo = authenticator.generateSecret();
     
    const optauth = authenticator.keyuri(
        email,
        'CryptoTrade',
        segredo
    );

    const imagem = qrcode.imageSync(optauth, { type: svg });

    return {
        segredo,
        qrcode: imagem
    }
}

const validarOtp = (segredo, token) => {
    return authenticator.check(token, segredo);
}

module.exports = {
    gerarSegredo,
    validarOtp
}