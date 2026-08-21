const { Schema } = require('mongoose');

const relatorioSchema = new Schema({
    saldo: {
        type: Number,
        required: true,
        min:0,
    },
    usuarioId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    data: {
        type: Date,
        required: true,
    },
});

module.exports = {
    relatorioSchema
}