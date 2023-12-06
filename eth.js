require('dotenv').config();
const WebSocket = require('ws');
const axios = require('axios');
const api = require("./api");
// const Futures = require("./database/FuturosModel")
const { SMA, EMA, MACD } = require('technicalindicators');

// const Medias = require("./medias");

/////////////////////////////////////////////////////////////////////
const TimeFrame = '15m'
const alavancagem = 20
const symbol = 'ETHUSDT';
const valor_entrada = 0.10
const Fibo_periodo = 40; // Período de retorno

const ws = new WebSocket(`${process.env.STREAM_URL}${symbol.toLowerCase()}@markPrice@1s`, {
    handshakeTimeout: 60000, // Tempo limite de aperto de mão em milissegundos
});

let Operacao_aberta = 0;

//*************************************************************************************** */
// usar essa api apenas para consulta da moeda
const Binance = require('binance-api-node')
const binance = new Binance.default({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.SECRET_KEY
})
//*************************************************************************************** */



ws.onmessage = async (event) => {
    try {
        let obj = JSON.parse(event.data);
        // process.stdout.write('\033c');
        //    console.log(`Symbol: ${obj.s}`);
        // console.log(`Mark Price: ${obj.p}`);
        const price = parseFloat(obj.p);

        // dados da minha conta
        let dados_conta = await api.accountInfo()
        let initialMargin = parseFloat(dados_conta.totalInitialMargin)
        // let valor_entrada = (initialMargin * alavancagem / price).toFixed(2)
        // let valor_entrada = 0.01
        // process.exit();

        let simbulo = symbol
        let candles = await binance.futuresCandles({
            symbol: simbulo,
            interval: TimeFrame,
        });

        let vl = candles[candles.length - 2];
        let ultima_vela = parseFloat(vl.close);


        let closeValues = candles.map(candle => parseFloat(candle.close));

        let sma1 = SMA.calculate({ period: 24, values: closeValues });
        let media24 = sma1[sma1.length - 1];

        let sam2 = SMA.calculate({ period: 52, values: closeValues });
        let media52 = sam2[sam2.length - 1];


        // Encontrar o maior e o menor preço nos últimos 'Fibo_periodo' candles
        const lastHigh = Math.max(...closeValues.slice(-Fibo_periodo));
        const lastLow = Math.min(...closeValues.slice(-Fibo_periodo));

        // Calcular a faixa de Fibonacci
        const fibRange = lastHigh - lastLow;

        // Calcular os níveis de Fibonacci
        const fibo_100 = lastHigh;
        const fibo_0 = lastLow;
        const fibo_50 = lastHigh - fibRange * 0.5;

        // console.log("100: " + fibo_100);
        // console.log(" 50: " + fibo_50);
        // console.log("  0: " + fibo_0);
        // console.log(" : " + ultima_vela);
        // console.log(" 24: " + media24);
        // console.log(" 52: " + media52);


        // sinal de compra
        if (ultima_vela > fibo_50 && ultima_vela > media24 && media24 > media52 && Operacao_aberta === 0) {
            api.newOrder(symbol, valor_entrada, "BUY")
                .then(result => {
                    console.log(result);
                })
                .catch(err => console.error(err));          
            Operacao_aberta = 1
            console.log("Compra " + ultima_vela)
        }
        // // // stop de compra 
        if (Operacao_aberta === 1 && (ultima_vela < fibo_50 || ultima_vela < media24)) {
            // stop de compra 
            api.newOrder(symbol, valor_entrada, "SELL")
                .then(result => {
                    console.log(result);
                })
                .catch(err => console.error(err));
            Operacao_aberta = 0   
            console.log("Stop da Compra " + ultima_vela);       
        }

        /// sinal de venda
        // if (ultima_vela < fibo_50 && ultima_vela < media24 && media24 < media52 && Operacao_aberta === 0) {
        //     api.newOrder(symbol, valor_entrada, "SELL")
        //         .then(result => {
        //             console.log(result);
        //         })
        //         .catch(err => console.error(err));
        //     Operacao_aberta = 2    
        //     console.log("Venda" + ultima_vela)       
        // }

        // // stop de venda 
        // if (Operacao_aberta === 2 && (ultima_vela > fibo_50 || ultima_vela > media24)) {        
        //     api.newOrder(symbol, valor_entrada, "BUY")
        //         .then(result => {
        //             console.log(result);
        //         })
        //         .catch(err => console.error(err));    
        //     Operacao_aberta = 0
        //     console.log("Stop da Venda" + ultima_vela);
          
        // }



    } catch (error) {
        console.log('Erro index: ', error);
    }



}


// Informações da conta
// setInterval(() => {
//     api.accountInfo()
//         .catch(err => console.error(err));
// }, 10000)


