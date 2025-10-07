const { Schema } = require('mongoose');
const { cpf } = require('cpf-cnpj-validator');

const SaqueSchema = new Schema({
    valor: {
        type: Number,
        required: true,
        min: 1,
    },
    data: {
        type: Date,
        required: true,
    },
});

const DepositoSchema = new Schema({
    valor: {
        type: Number,
        required: true,
        min: 100,
    },
    data: {
        type: Date,
        required: true,
    },
    cancelado: {
        type: Boolean,
        default: false,
    },
});

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
    },
    depositos: [DepositoSchema],
    saques: [SaqueSchema],
});

module.exports = {
    UsuarioSchema,
}