require('dotenv').config();
const WebSocket = require('ws');
const axios = require('axios');
const api = require("./api");
// const eth = require("./eth");
const { SMA, EMA, MACD } = require('technicalindicators');

// const Medias = require("./medias");

/////////////////////////////////////////////////////////////////////
const TimeFrame = '5m'
const alavancagem = 20
const symbol = 'ETHUSDT';
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
        let valor_entrada = 0.01
        // process.exit();

        let simbulo = symbol
        let candles = await binance.futuresCandles({
            symbol: simbulo,
            interval: TimeFrame,
        });

        let vl = candles[candles.length - 2];
        let ultima_vela = parseFloat(vl.close);


        let closeValues = candles.map(candle => parseFloat(candle.close));

        let sma4 = SMA.calculate({ period: 16, values: closeValues });
        let media15 = sma4[sma4.length - 2];

        let sma1 = SMA.calculate({ period: 22, values: closeValues });
        let media21 = sma1[sma1.length - 2];

        let sam2 = SMA.calculate({ period: 51, values: closeValues });
        let media50 = sam2[sam2.length - 2];

        let sma3 = SMA.calculate({ period: 101, values: closeValues });
        let media100 = sma3[sma3.length - 2];


        /////////////////////Macd////////////////////////////////////////////////////

        // let mac1 = EMA.calculate({ period: 13, values: closeValues });
        // let mac12_md = mac1[mac1.length - 2];

        // let mac2 = EMA.calculate({ period: 27, values: closeValues });
        // let mac26_md = mac2[mac2.length - 2];

       
        const input = {
            values: closeValues,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        };
        
        const result = MACD.calculate(input);
        
        const macd = result[result.length - 1].MACD;
        const sinal = result[result.length - 1].signal;
        const histograma = result[result.length - 1].histogram;
        
        // console.log({
        //     macd,
        //     sinal,
        //     histograma,
        
        // });

       
        // sinal de compra 

        if (macd  > sinal && histograma > 0 && Operacao_aberta === 0) {
            console.log("Compra")
            Operacao_aberta = 1
            api.newOrder(symbol, valor_entrada, "BUY")
                .then(result => {
                    console.log(result);
                })
                .catch(err => console.error(err));
        }

        // // stop de compra 
        if (Operacao_aberta === 1 && (macd  < sinal || histograma < 0 )) {
            // stop de compra 
            console.log("Stop da Compra");
            Operacao_aberta = 0
            api.newOrder(symbol, valor_entrada, "SELL")
                .then(result => {
                    console.log(result);
                })
                .catch(err => console.error(err));
        }

        // // sinal de venda 
        if (macd  < sinal && histograma < 0 && Operacao_aberta === 0) {
            console.log("Venda")
            Operacao_aberta = 2
            api.newOrder(symbol, valor_entrada, "SELL")
                .then(result => {
                    console.log(result);
                })
                .catch(err => console.error(err));
        }
        // // stop de venda 
        if (Operacao_aberta === 2 && (macd  > sinal || histograma > 0 )) {
            console.log("Stop da Venda");
            Operacao_aberta = 0
            api.newOrder(symbol, valor_entrada, "BUY")
                .then(result => {
                    console.log(result);
                })
                .catch(err => console.error(err));

        }


        // sinal de compra 

        // if (ultima_vela > media15 && media15 > media21 && media21 > media50 && media50 > media100 && Operacao_aberta === 0) {
        //     console.log("Compra")
        //     Operacao_aberta = 1
        //     api.newOrder(symbol, valor_entrada, "BUY")
        //         .then(result => {
        //             console.log(result);
        //         })
        //         .catch(err => console.error(err));
        // }

        // // stop de compra 
        // if (Operacao_aberta === 1 && (ultima_vela < media15 || ultima_vela < media21)) {
        //     // stop de compra 
        //     console.log("Stop da Compra");
        //     Operacao_aberta = 0
        //     api.newOrder(symbol, valor_entrada, "SELL")
        //         .then(result => {
        //             console.log(result);
        //         })
        //         .catch(err => console.error(err));
        // }

        // // sinal de venda 
        // if (ultima_vela < media15 && media15 < media21 && media21 < media50 && media50 < media100 && Operacao_aberta === 0) {
        //     console.log("Venda")
        //     Operacao_aberta = 2
        //     api.newOrder(symbol, valor_entrada, "SELL")
        //         .then(result => {
        //             console.log(result);
        //         })
        //         .catch(err => console.error(err));
        // }
        // // stop de venda 
        // if (Operacao_aberta === 2 && (ultima_vela > media15 || ultima_vela > media21)) {
        //     console.log("Stop da Venda");
        //     Operacao_aberta = 0
        //     api.newOrder(symbol, valor_entrada, "BUY")
        //         .then(result => {
        //             console.log(result);
        //         })
        //         .catch(err => console.error(err));

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


