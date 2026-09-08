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
      Saque: {
        type: "object",
        properties: {
          valor: {
            type: "number",
            example: 200,
          },
          data: {
            type: "string",
            format: "date-time",
            example: "2024-01-15T10:30:00.000Z",
          },
        },
      },
      Deposito: {
        type: "object",
        properties: {
          valor: {
            type: "number",
            example: 500,
          },
          data: {
            type: "string",
            format: "date-time",
            example: "2024-01-15T10:30:00.000Z",
          },
          cancelado: {
            type: "boolean",
            example: false,
          },
        },
      },
      Moeda: {
        type: "object",
        properties: {
          codigo: {
            type: "string",
            example: "BTC",
          },
          quantidade: {
            type: "number",
            example: 1.5,
          },
        },
      },
      SaqueRequest: {
        type: "object",
        required: ["valor"],
        properties: {
          valor: {
            type: "number",
            minimum: 1,
            example: 200,
            description: "Valor em reais a ser sacado (mínimo R$ 1,00)",
          },
        },
      },
      SaqueCryptoRequest: {
        type: "object",
        required: ["valor"],
        properties: {
          valor: {
            type: "number",
            example: 0.5,
            description: "Quantidade da moeda a ser sacada",
          },
        },
      },
      DepositoRequest: {
        type: "object",
        required: ["valor"],
        properties: {
          valor: {
            type: "number",
            minimum: 100,
            example: 500,
            description: "Valor em reais a ser depositado (mínimo R$ 100)",
          },
        },
      },
      TrocaRequest: {
        type: "object",
        required: ["cotacaoId", "quantidade", "operacao"],
        properties: {
          cotacaoId: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
            description: "ID da cotação obtido em GET /v1/cotacoes",
          },
          quantidade: {
            type: "number",
            example: 0.001,
            description: "Quantidade de crypto a comprar ou vender",
          },
          operacao: {
            type: "string",
            enum: ["compra", "venda"],
            example: "compra",
            description: "Tipo de operação — compra (BRL → crypto) ou venda (crypto → BRL)",
          },
        },
      },
      RespostaErro: {
        type: "object",
        properties: {
          sucesso: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Descrição do erro ocorrido.",
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
