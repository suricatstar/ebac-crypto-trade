const jsonWebToken = require('jsonwebtoken');

const { Usuario } = require('../models');

const validaTokenAlteracaoDeSenha = async (token) => {
    try{
        const jwt = jsonWebToken.verify(token, process.env.JWT_SECRET);

        const usuario = await Usuario.findOne({ tokenDeRecuperacao: jwt.token });

        if (!usuario){
            throw new Error('Token não encontrado!');
        }

        const novoJwt = jsonWebToken.sign(
            { id: usuario._id },
            process.env.JWT_SECRET,
        );

        return novoJwt;
    }
    catch(e){
        throw new Error('Token não encontrado ou expirado. Requisite um novo!');
    }
}

module.exports= { validaTokenAlteracaoDeSenha };