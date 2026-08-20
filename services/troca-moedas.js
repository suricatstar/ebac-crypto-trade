const { Cotacao } = require('../models');
const { CNPJ, TAXA_DE_TROCA } = require('../constants');

const buscaCotacao = async(cotacaoId) => {
    const cotacao = await Cotacao.findOne({
        _id: cotacaoId,
        data: {
            $gte: new Date((new Date()).valueOf() - 60000 * 15),
        }
    });

    if (!cotacao){
        throw new Error('Cotacão inválida ou expirada!')
    }

    return cotacao;
};

const trocaMoedas = async(usuario, cotacaoId, quantidade, operacao) => {
    if (!quantidade || !operacao) {
        throw new Error('Você deve informar a quantidade desejada e a operação (compra ou venda) desejada!')
    }

    // Valida a cotação

    const cotacaoValida = await buscaCotacao(cotacaoId);
    // Calcula o valor em reais

    const reaisNecessarios = (cotacaoValida.valor * quantidade);
    // Busca a corretora
    const corretora = await Corretora.findOne({ cnpj: CNPJ });

    if (corretora.caixa < reaisNecessarios) {
        throw new Error('Valor muito grande, não temos caixa no momento para essa operação')
    }

    const moedasEmReais = usuario.moedas.find(m => m.codigo === 'BRL');
    const moedaEmCrypto = usuario.moedas.find(m => m.codigo === cotacaoValida.moeda);
    const taxaCorretora = TAXA_DE_TROCA * quantidade;

    if(operacao === 'comprar'){
        if(!moedasEmReais || moedasEmReais.quantidade < reaisNecessarios){
            throw new Error('Você não possui Saldo insuficiente para realizar essa operação! DEposite mais dinheiro!');
        }   
        
        if (moedaEmCrypto){
            moedaEmCrypto.quantidade += (quantidade - taxaCorretora);
        } else {
            usuario.moedas.push({
                codigo: cotacaoValida.moeda,
                quantidade: quantidade - taxaCorretora
            })
        }

    } else {
        if (!moedaEmCrypto || moedaEmCrypto.quantidade < quantidade){
            throw new Error('Você não possui saldo suficiente para realizar essa operação! Compre mais Cryptos!');
        }

        moedasEmReais.quantidade += (reaisNecessarios - taxaCorretora * cotacaoValida.valor);
        moedaEmCrypto.quantidade -= quantidade
    }

    await usuario.save();
    corretora.caixa += taxaCorretora * cotacaoValida.valor;
    await corretora.save();

    return usuario.moedas;

};


    
module.exports =  {trocaMoedas}