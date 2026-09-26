const { Usuario, Cotacao } = require('../../../models');
const { sacaBrl } = require('../../../services/saca-brl');

describe('sacaBrl', () => {
    let usuario;

    // Cria um usuario com saldo BRL suficiente antes de cada teste
    beforeEach(async () => {
        usuario = await Usuario.create({
            nome: 'Usuario de Teste',
            email: 'saca-brl@teste.com.br',
            senha: 'senha-teste',
            cpf: '529.982.247-25', // CPF valido
            confirmado: true,
            tokenDeConfirmacao: 'token-de-confirmacao-teste',
            moedas: [{ codigo: 'BRL', quantidade: 1000 }],
        });
    });

    describe('quando o valor e invalido', () => {
        test('lanca erro se o valor for zero', async () => {
            await expect(sacaBrl(usuario, 0)).rejects.toThrow('O valor do saque deve ser maior que zero.');
        });

        test('lanca erro se o valor for negativo', async () => {
            await expect(sacaBrl(usuario, -50)).rejects.toThrow('O valor do saque deve ser maior que zero.');
        });

        test('lanca erro se o valor for undefined', async () => {
            await expect(sacaBrl(usuario, undefined)).rejects.toThrow('O valor do saque deve ser maior que zero.');
        });
    });

    describe('quando o saldo e insuficiente', () => {
        test('lanca erro informando saldo insuficiente', async () => {
            await expect(sacaBrl(usuario, 9999)).rejects.toThrow('Saldo insuficiente para realizar o saque.');
        });
    });

    describe('quando o saque e bem-sucedido', () => {
        let resultado;

        beforeEach(async () => {
            resultado = await sacaBrl(usuario, 200);
        });

        test('retorna o saldo restante correto', () => {
            expect(resultado.saldo).toBe(800);
        });

        test('retorna a lista de saques com o novo saque', () => {
            expect(resultado.saques).toHaveLength(1);
            expect(resultado.saques[0].valor).toBe(200);
        });

        test('persiste o saque no banco de dados', async () => {
            const usuarioAtualizado = await Usuario.findById(usuario._id);
            expect(usuarioAtualizado.saques).toHaveLength(1);
            expect(usuarioAtualizado.saques[0].valor).toBe(200);
        });

        test('desconta o valor da moeda BRL do usuario', async () => {
            const usuarioAtualizado = await Usuario.findById(usuario._id);
            const moedaBrl = usuarioAtualizado.moedas.find((m) => m.codigo === 'BRL');
            expect(moedaBrl.quantidade).toBe(800);
        });

        test('adiciona uma data ao registro de saque', () => {
            expect(resultado.saques[0].data).toBeInstanceOf(Date);
        });
    });

    describe('quando ha multiplas moedas (BTC e BRL)', () => {
        // Nesse cenario reutilizamos o usuario do beforeEach externo e adicionamos BTC a ele
        beforeEach(async () => {
            await Cotacao.create({ moeda: 'BTC', valor: 300000, data: new Date() });

            // Adiciona BTC ao usuario ja existente (BRL = 500, BTC = 0.001 -> total R\)
            usuario.moedas[0].quantidade = 500; // ajusta BRL para 500
            usuario.moedas.push({ codigo: 'BTC', quantidade: 0.001 });
            await usuario.save();
        });

        test('calcula o saldo total considerando todas as moedas', async () => {
            const resultado = await sacaBrl(usuario, 750);
            // saldo = 500 (BRL) + 0.001 * 300000 (BTC) = 800 -> saldo apos saque = 50
            expect(resultado.saldo).toBe(50);
        });

        test('lanca erro se o valor superar o saldo total', async () => {
            await expect(sacaBrl(usuario, 900)).rejects.toThrow('Saldo insuficiente para realizar o saque.');
        });
    });
});