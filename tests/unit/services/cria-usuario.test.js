const {criaUsuario} = require('../../../services/cria-usuario');
const { Usuario } = require('../../../models');
const { enviaEmailDeConfirmacao } = require('../../../services/envia-email');

jest.mock('../../../services/envia-email', () => {
    return {
        enviaEmailDeConfirmacao: jest.fn(),
    };
});

const usuarioMock = {
    email: 'test@ebac.com.br',
    senha: 'teste@1234',
    cpf: '301.372.350-54',
    nome: 'Usuário de teste'
};

describe('se uma senha não é informada', () => {
    test('ele dá um erro informando a ausência da senha', () => {
        const usuarioTest = { ...usuarioMock, senha: undefined };

        return expect(() => criaUsuario(usuarioTest, 'https://www.google.com.br')).rejects.toThrow('O campo senha é obrigatório');
    });
});

describe('se a senha informada é fraca', () => {
    test('ele dá um erro informando que a senha é muito curta', () => {
        const usuarioTest = { ...usuarioMock, senha: '123' };

        return expect(() => criaUsuario(usuarioTest, 'https://www.google.com.br')).rejects.toThrow('Senha deve ter no mínimo 6 caracteres');
    });
});

describe('se a url de redirecionamento não for passada', () => {
    test('ele dá um erro informando a ausência da url de redirecionamento', () => {

        return expect(() => criaUsuario(usuarioMock, null)).rejects.toThrow('A Url de redirecionamento é obrigatória');
    });
});

describe('quando as informações passadas são válidas', () => {
    let resposta;

    beforeEach(async () => {
        resposta = await criaUsuario(usuarioMock, 'https://www.google.com.br');
    });
    
    test('ele retorna o usuário salvo', async() => {
        expect(resposta.email).toBe(usuarioMock.email);
    });

    test('ele não retorna a senha', () => {
        expect(resposta.senha).toBeUndefined();
    });

    test('ele cria um usuário não confirmado', () => {
        expect(resposta.confirmado).toBe(false);
    });

    test('ele insere apenas um usuário no banco', async() => {
        expect((await Usuario.find()).length).toBe(1);
    });

    test('ele chama corretamente o email de confirmação', () => {
        expect(enviaEmailDeConfirmacao.mock.calls.length).toBe(1);
        expect(enviaEmailDeConfirmacao.mock.calls[0][1]).toBe('https://www.google.com.br');
        expect(enviaEmailDeConfirmacao.mock.calls[0][0].email).toBe(usuarioMock.email);
    });
});