const { Usuario } = require('../models');
const bcrypt = require('bcrypt');

const criaUsuario = async(usuario) => {
    if(!usuario.senha){
        throw new Error('Senha é obrigatória');
    }
    if(usuario.senha.length < 6){
        throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    const hashSenha = await bcrypt.hash(usuario.senha, 10);
   
    usuario.senha = hashSenha;

    const { senha, ...usuarioSalvo } = (await Usuario.create(usuario))._doc;

    return usuarioSalvo;

};

module.exports = { criaUsuario };