const { Usuario } = require('../models');

const cancelaDeposito = async (usuario, depositoId) => {
    const usuarioCompleto = await Usuario.findById(usuario._id);
    
    if (!usuarioCompleto) {
        throw new Error('Usuário não encontrado');
    }

    const deposito = usuarioCompleto.depositos.id(depositoId);
    
    if (!deposito) {
        throw new Error('Depósito não encontrado');
    }

    if (deposito.cancelado) {
        throw new Error('Depósito já foi cancelado');
    }

    deposito.cancelado = true;
    
    await usuarioCompleto.save();

    return {
        mensagem: 'Depósito cancelado com sucesso',
        deposito: deposito
    };
};

module.exports = { cancelaDeposito };