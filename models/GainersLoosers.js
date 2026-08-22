const { Schema } = require('mongoose');

const ClienteMovimentacaoSchema = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
    },
    variacao: {
        type: Number,
        required: true,
    }
}, {
    _id: false
});

const TopClientsSchema = new Schema({
    dia: {
        type: Date,
        required: true,
        unique: true,
    },
    gainers: {
        type: [ClienteMovimentacaoSchema],
        default: [],
    },
    loosers: {
        type: [ClienteMovimentacaoSchema],
        default: [],
    }
});

module.exports = TopClientsSchema;