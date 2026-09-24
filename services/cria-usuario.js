const { Usuario } = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { enviaEmailDeConfirmacao } = require('./envia-email');

const criaUsuario = async(usuario, urlDeRedirecionamento) => {
    if(!usuario.senha){
        throw new Error('O campo senha é obrigatório');
    }
    if(usuario.senha.length < 6){
        throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    if(!urlDeRedirecionamento){
        throw new Error('A Url de redirecionamento é obrigatória');
    }

    const hashSenha = await bcrypt.hash(usuario.senha, 10);
   
    usuario.senha = hashSenha;

    usuario.tokenDeConfirmacao = crypto.randomBytes(32).toString('hex');

    const { senha, ...usuarioSalvo } = (await Usuario.create(usuario))._doc;

    await enviaEmailDeConfirmacao(usuarioSalvo, urlDeRedirecionamento);

    return usuarioSalvo;

};

module.exports = { criaUsuario };