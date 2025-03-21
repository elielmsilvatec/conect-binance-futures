require("dotenv").config();
const WebSocket = require("ws");
const axios = require("axios");
const api = require("./api");

// const Medias = require("./medias");

/////////////////////////////////////////////////////////////////////
const TimeFrame = "1h";
const alavancagem = 2;
const symbol = "ETHUSDT";
const valor_entrada = 0.001;

const AF_INITIAL = 0.02; // Fator de aceleração inicial
const AF_MAX = 0.2; // Limite do fator de aceleração
let SAR = 0; // Valor inicial do SAR
let EP = 0; // Ponto extremo
let AF = AF_INITIAL; // Fator de aceleração

// Variável para armazenar a EMA anterior
let previousEMA = 0;

const ws = new WebSocket(
  `${process.env.STREAM_URL}${symbol.toLowerCase()}@markPrice@1s`,
  {
    handshakeTimeout: 60000, // Tempo limite de aperto de mão em milissegundos
  }
);

let Operacao_aberta = 0;

//*************************************************************************************** */
// usar essa api apenas para consulta da moeda
const Binance = require("binance-api-node");
const binance = new Binance.default({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.SECRET_KEY,
});
//*************************************************************************************** */
// Função para calcular o SAR
function calcularSAR(candle) {
  // Determinar se estamos em uma tendência de alta ou baixa
  if (candle.close > SAR) {
    // Tendência de alta
    EP = Math.max(candle.high, EP); // O ponto extremo será a máxima do candle
  } else {
    // Tendência de baixa
    EP = Math.min(candle.low, EP); // O ponto extremo será a mínima do candle
  }

  // Calcular o próximo SAR
  SAR = SAR + AF * (EP - SAR);

  // Ajustar o fator de aceleração
  if (EP === candle.high) {
    AF = Math.min(AF + 0.02, AF_MAX); // Aumenta o AF em 0.02 até o limite máximo
  } else if (EP === candle.low) {
    AF = Math.min(AF + 0.02, AF_MAX); // Aumenta o AF em 0.02 até o limite máximo
  }

  return SAR;
}

// Função para calcular a EMA de 20 períodos
function calcularEMA(candles, periodo = 20) {
  // O preço de fechamento do último candle
  let closePrice = parseFloat(candles[candles.length - 1].close);

  // Calculando o fator de suavização K
  const K = 2 / (periodo + 1);

  // Se não temos uma EMA anterior (caso seja o primeiro cálculo), inicializamos com o fechamento
  if (previousEMA === 0) {
    previousEMA = closePrice;
  }

  // Calcula a EMA atual
  let EMA = closePrice * K + previousEMA * (1 - K);

  // Atualiza o valor da EMA anterior para o próximo cálculo
  previousEMA = EMA;

  return EMA;
}

// Função para buscar o Fear and Greed Index
async function obterFearAndGreedIndex() {
    try {
      const response = await axios.get("https://api.alternative.me/fng/");
      const data = response.data;
  
      const indexAtual = data.data[0];
      console.log(`Fear and Greed Index: ${indexAtual.value} (${indexAtual.value_classification})`);
      return {
        valor: parseInt(indexAtual.value),
        classificacao: indexAtual.value_classification,
      };
    } catch (error) {
      console.error("Erro ao buscar o Fear and Greed Index:", error);
      return null;
    }
  }
  
ws.onmessage = async (event) => {
  try {
    let obj = JSON.parse(event.data);
    const price = parseFloat(obj.p);

    // dados da minha conta
    let dados_conta = await api.accountInfo();
    let initialMargin = parseFloat(dados_conta.totalInitialMargin);

    let simbulo = symbol;
    let candles = await binance.futuresCandles({
      symbol: simbulo,
      interval: TimeFrame,
      limit: 2, // Pegue os últimos dois candles
    });


    // Pegue o último candle para calcular o SAR
    let vl = candles[1]; // O segundo último candle (o último válido para o cálculo)
    let lastHigh = parseFloat(vl.high);
    let lastLow = parseFloat(vl.low);
    let lastClose = parseFloat(vl.close);

    let aux = candles[candles.length - 2];
    let ultima_vela = parseFloat(aux.close);

    // Calcular o SAR
    let novoSAR = calcularSAR({
      high: lastHigh,
      low: lastLow,
      close: lastClose,
    });
    // Calcular a EMA de 20 períodos
    let EMA20 = calcularEMA(candles);



    // Adicione o Fear and Greed Index
    const fng = await obterFearAndGreedIndex();

    if (fng) {
      console.log(`Fear and Greed Index atual: ${fng.valor} (${fng.classificacao})`);

      // Lógica com base no Fear and Greed Index
      if (fng.valor < 25) {
        console.log("Medo extremo detectado. Avaliando compra...");
        // Lógica para compra
      } else if (fng.valor > 75) {
        console.log("Ganância extrema detectada. Avaliando venda...");
        // Lógica para venda
      } else {
        console.log("Mercado neutro. Monitorando...");
      }
    }
    

  } catch (error) {
    console.log("Erro index: ", error);
  }
};

// Informações da conta
// setInterval(() => {
//     api.accountInfo()
//         .catch(err => console.error(err));
// }, 10000)
