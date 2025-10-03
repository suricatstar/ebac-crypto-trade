const JsonWebToken  = require('jsonwebtoken');

const { Usuario } = require('../models');

const bcrypt = require('bcrypt');


const logaUsuario = async (email, senha) => {
    if (!email || !senha) {
        throw new Error('Email e senha são obrigatórios');
    }

    const usuario = await Usuario.findOne({ email: email }).select('senha');

    if (!usuario) {
        throw new Error('Usuario não encontrado');
    }

    if (!await bcrypt.compare(senha, usuario.senha)){
        throw new Error('Senha inválida');
    }

    return JsonWebToken.sign({ id: usuario._id }, process.env.JWT_SECRET);

}

module.exports = {logaUsuario};