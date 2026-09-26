const request = require('supertest');
const faker = require('faker-br');
const { authenticator } = require('otplib');

const { Usuario, Cotacao } = require('../../../models');
const app = require('../../../app');
const { geraJwt, checaAutenticacao } = require('./shared/autenticacao');

// GET /v1/saques
describe('GET /v1/saques', () => {
    checaAutenticacao('/v1/saques');

    describe('quando o usuario existe', () => {
        let usuario, jwt;

        beforeEach(async () => {
            usuario = await Usuario.create({
                nome: 'Usuario Teste Saques',
                email: 'saques-get@teste.com.br',
                senha: 'qualquer-uma',
                cpf: faker.br.cpf(),
                confirmado: true,
                tokenDeConfirmacao: 'token-get-saques',
            });
            jwt = geraJwt(usuario._id);
        });

        describe('e nao tem saques registrados', () => {
            test('retorna 200', () => {
                return request(app)
                    .get('/v1/saques')
                    .set('Authorization', 'Bearer ' + jwt)
                    .expect(200);
            });

            test('retorna sucesso true e lista vazia', () => {
                return request(app)
                    .get('/v1/saques')
                    .set('Authorization', 'Bearer ' + jwt)
                    .then((resposta) => {
                        expect(resposta.body.sucesso).toBe(true);
                        expect(resposta.body.message).toEqual([]);
                    });
            });
        });

        describe('e tem saques registrados', () => {
            beforeEach(async () => {
                usuario.saques.push({ valor: 500, data: new Date() });
                usuario.saques.push({ valor: 300, data: new Date() });
                await usuario.save();
            });

            test('retorna 200', () => {
                return request(app)
                    .get('/v1/saques')
                    .set('Authorization', 'Bearer ' + jwt)
                    .expect(200);
            });

            test('retorna a lista com todos os saques', () => {
                return request(app)
                    .get('/v1/saques')
                    .set('Authorization', 'Bearer ' + jwt)
                    .then((resposta) => {
                        expect(resposta.body.sucesso).toBe(true);
                        expect(resposta.body.message).toHaveLength(2);
                        expect(resposta.body.message[0].valor).toBe(500);
                        expect(resposta.body.message[1].valor).toBe(300);
                    });
            });
        });
    });
});

// POST /v1/saques (saque em BRL com OTP)
describe('POST /v1/saques', () => {
    let usuario, jwt, segredoOtp;

    beforeEach(async () => {
        segredoOtp = authenticator.generateSecret();
        usuario = await Usuario.create({
            nome: 'Usuario Saque BRL',
            email: 'saque-brl@teste.com.br',
            senha: 'qualquer-uma',
            cpf: faker.br.cpf(),
            confirmado: true,
            tokenDeConfirmacao: 'token-post-saque',
            segredoOtp: segredoOtp,
            moedas: [{ codigo: 'BRL', quantidade: 1000 }],
        });
        jwt = geraJwt(usuario._id);
    });

    const geraTotp = () => authenticator.generate(segredoOtp);

    describe('cenarios de falha de autenticacao', () => {
        test('sem JWT retorna 401', () => {
            return request(app).post('/v1/saques').expect(401);
        });

        test('sem header TOTP retorna 401', () => {
            return request(app)
                .post('/v1/saques')
                .set('Authorization', 'Bearer ' + jwt)
                .send({ valor: 100 })
                .expect(401);
        });

        test('com TOTP errado retorna 401', () => {
            return request(app)
                .post('/v1/saques')
                .set('Authorization', 'Bearer ' + jwt)
                .set('totp', '000000')
                .send({ valor: 100 })
                .expect(401);
        });
    });

    describe('cenarios de falha de negocio', () => {
        test('retorna 422 quando o saldo e insuficiente', () => {
            return request(app)
                .post('/v1/saques')
                .set('Authorization', 'Bearer ' + jwt)
                .set('totp', geraTotp())
                .send({ valor: 9999 })
                .expect(422)
                .then((resposta) => {
                    expect(resposta.body.sucesso).toBe(false);
                    expect(resposta.body.message).toBeTruthy();
                });
        });

        test('retorna 422 quando o valor e zero', () => {
            return request(app)
                .post('/v1/saques')
                .set('Authorization', 'Bearer ' + jwt)
                .set('totp', geraTotp())
                .send({ valor: 0 })
                .expect(422);
        });
    });

    describe('cenario de sucesso', () => {
        test('retorna 200 com saldo e lista de saques atualizada', () => {
            return request(app)
                .post('/v1/saques')
                .set('Authorization', 'Bearer ' + jwt)
                .set('totp', geraTotp())
                .send({ valor: 400 })
                .expect(200)
                .then((resposta) => {
                    expect(resposta.body.sucesso).toBe(true);
                    expect(resposta.body.saldo).toBe(600);
                    expect(resposta.body.saques).toHaveLength(1);
                    expect(resposta.body.saques[0].valor).toBe(400);
                });
        });

        test('persiste o saque no banco de dados', async () => {
            await request(app)
                .post('/v1/saques')
                .set('Authorization', 'Bearer ' + jwt)
                .set('totp', geraTotp())
                .send({ valor: 250 });
            const usuarioAtualizado = await Usuario.findById(usuario._id);
            expect(usuarioAtualizado.saques).toHaveLength(1);
            expect(usuarioAtualizado.saques[0].valor).toBe(250);
        });

        test('desconta corretamente o saldo BRL do usuario', async () => {
            await request(app)
                .post('/v1/saques')
                .set('Authorization', 'Bearer ' + jwt)
                .set('totp', geraTotp())
                .send({ valor: 300 });
            const usuarioAtualizado = await Usuario.findById(usuario._id);
            const moedaBrl = usuarioAtualizado.moedas.find((m) => m.codigo === 'BRL');
            expect(moedaBrl.quantidade).toBe(700);
        });
    });
});

// POST /v1/saques/:codigo (saque de crypto)
describe('POST /v1/saques/:codigo', () => {
    let usuario, jwt;

    beforeEach(async () => {
        await Cotacao.create({ moeda: 'BTC', valor: 300000, data: new Date() });
        usuario = await Usuario.create({
            nome: 'Usuario Saque Crypto',
            email: 'saque-crypto@teste.com.br',
            senha: 'qualquer-uma',
            cpf: faker.br.cpf(),
            confirmado: true,
            tokenDeConfirmacao: 'token-crypto-saque',
            moedas: [
                { codigo: 'BRL', quantidade: 100 },
                { codigo: 'BTC', quantidade: 0.5 },
            ],
        });
        jwt = geraJwt(usuario._id);
    });

    describe('cenarios de falha de autenticacao', () => {
        test('sem JWT retorna 401', () => {
            return request(app).post('/v1/saques/BTC').expect(401);
        });
    });

    describe('cenarios de falha de negocio', () => {
        test('retorna 422 quando a quantidade supera o saldo disponivel', () => {
            return request(app)
                .post('/v1/saques/BTC')
                .set('Authorization', 'Bearer ' + jwt)
                .send({ valor: 999 })
                .expect(422)
                .then((resposta) => {
                    expect(resposta.body.sucesso).toBe(false);
                    expect(resposta.body.message).toBeTruthy();
                });
        });

        test('retorna 422 quando o codigo da moeda nao existe na carteira', () => {
            return request(app)
                .post('/v1/saques/ETH')
                .set('Authorization', 'Bearer ' + jwt)
                .send({ valor: 1 })
                .expect(422)
                .then((resposta) => {
                    expect(resposta.body.sucesso).toBe(false);
                });
        });
    });

    describe('cenario de sucesso', () => {
        test('retorna 200 com a lista de moedas atualizada', () => {
            return request(app)
                .post('/v1/saques/BTC')
                .set('Authorization', 'Bearer ' + jwt)
                .send({ valor: 0.1 })
                .expect(200)
                .then((resposta) => {
                    expect(resposta.body.sucesso).toBe(true);
                    expect(Array.isArray(resposta.body.moedas)).toBe(true);
                    const btc = resposta.body.moedas.find((m) => m.codigo === 'BTC');
                    expect(btc.quantidade).toBeCloseTo(0.4);
                });
        });

        test('persiste o saldo de BTC atualizado no banco de dados', async () => {
            await request(app)
                .post('/v1/saques/BTC')
                .set('Authorization', 'Bearer ' + jwt)
                .send({ valor: 0.2 });
            const usuarioAtualizado = await Usuario.findById(usuario._id);
            const btc = usuarioAtualizado.moedas.find((m) => m.codigo === 'BTC');
            expect(btc.quantidade).toBeCloseTo(0.3);
        });
    });
});
