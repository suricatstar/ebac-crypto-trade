const request = require("supertest");
const jsonwebtoken = require("jsonwebtoken");
const faker = require("faker-br");

const app = require("../../../../app");

const geraJwt = (usuarioId) => {
  return jsonwebtoken.sign({ id: usuarioId }, process.env.JWT_SECRET);
};

const checaAutenticacao = (rota) => {
  describe("se o usuário não está logado", () => {
    test("ele recebe um 401", () => {
      return request(app).get(rota).expect(401);
    });

    test("ele informa o erro de autenticação", () => {
      return request(app)
        .get(rota)
        .then((resposta) => {
          expect(resposta.text).toBe("Unauthorized");
        });
    });
  });

  describe("se o usuário está logado e não existe", () => {
    const jwt = geraJwt(faker.random.uuid);

    test("ele recebe um 401", () => {
      return request(app)
        .get(rota)
        .set("Authorization", `Bearer ${jwt}`)
        .expect(401);
    });

    test("ele informa o erro de autenticação", () => {
      return request(app)
        .get(rota)
        .set("Authorization", `Bearer ${jwt}`)
        .then((resposta) => {
          expect(resposta.text).toBe("Unauthorized");
        });
    });
  });

};

module.exports = {
  geraJwt,
  checaAutenticacao,
};
