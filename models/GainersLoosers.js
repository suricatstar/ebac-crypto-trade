const { Schema } = require('mongoose');

const MovimentacaoSchema = new Schema({
    moeda: {
        type: String,
        required: true,
    },
    variacao: {
        type: Number,
        required: true,
    }
},{
    _id: false
});

const TopMoversSchema = new Schema({
    dia:{
        type: Date,
        required: true,
        unique: true
    },
    gainers:{
        type: [MovimentacaoSchema],
        default: [],
    },
    loosers:{
        type: [MovimentacaoSchema],
        default: [],
    }
});

module.exports = TopMoversSchema;