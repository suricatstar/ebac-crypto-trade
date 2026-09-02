const swaggerJSDoc = require("swagger-jsdoc");

const swaggerBase = {
  failOnErrors: true,
  openapi: "3.0.0",
  info: {
    title: "API da CryptoTrade",
    description:
      "Onde trocar cryptos é feito da forma mais fácil possivel para você desenvolvedor!",
    version: "0.0.1",
  },
  components: {
    securitySchemes: {
      auth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Insira seu JWT token aqui",
      },
    },
    schemas: {
      Cotação: {
        type: "object",
        properties: {
          moeda: {
            type: "string",
            example: "SQL",
          },
          data: {
            type: "datetime",
            example: "2022-10-09T16:00:00.398Z",
          },
          id: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
          valor: {
            type: "number",
            example: 4256.66,
          },
        },
      },
    },
  },
};

const opcoes = {
  definition: swaggerBase,
  apis: ["./routes/v1/*.js"],
};

module.exports = swaggerJSDoc(opcoes);
