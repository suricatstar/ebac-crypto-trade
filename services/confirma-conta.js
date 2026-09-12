const { Usuario } = require('../models');

const confirmaConta= async(token)=>{
    const usuario = await Usuario.findOne({ tokenDeConfirmacao: token });

    if(!usuario){
        throw new Error('Usuario não encontrado!');

    }else{
        usuario.confirmado = true;

        await usuario.save();
    }
};

module.exports = { confirmaConta };