const { Schema } = require('mongoose');
const { cpf } = require('cpf-cnpj-validator');

const UsuarioSchema = new Schema({
    nome: {
        type: String,
        required: true,
        min: 4
    },
    cpf: {
        type: String,
        required: true,
        unique: true,
        validator: {
            validator: function(v) {
                return cpf.isValid(v);
            },
            message: props => `${props.value} não é um CPF válido!`
        }
    },
    email: {
        type: String,
        required: true,
        min: 4,
        unique: true,
        validate: {
            validator: function(v) {
                return v.match('@');
            },
            message: props => `${props.value} não é um email válido!`
        }
    },
    senha: {
        type: String,
        required: true,
        min: 6,
        select: false,
    }
});

module.exports = {
    UsuarioSchema,
}