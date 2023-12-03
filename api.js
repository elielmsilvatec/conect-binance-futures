const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const apiKey = process.env.API_KEY;
const apiSecret = process.env.SECRET_KEY;
const apiUrl = process.env.API_URL;


const RISCO = 10
const ALAVANCAGEM = 10

async function getBinanceTime() {
    const response = await axios.get('https://api.binance.com/api/v3/time');
    return response.data.serverTime;
}

async function newOrder(symbol, quantity, side = 'BUY', type = 'MARKET', price = 1.00) {
    try {
        const data = { symbol, side, type, quantity };

        if (!apiKey || !apiSecret)
            throw new Error('Preencha corretamente sua API KEY e SECRET KEY');

        const timestamp = await getBinanceTime(); // Aqui usamos o timestamp da Binance
        const recvWindow = 600000;

        const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(`${new URLSearchParams({ ...data, timestamp, recvWindow }).toString()}`)
            .digest('hex');

        const newData = { ...data, timestamp, recvWindow, signature };
        const qs = `?${new URLSearchParams(newData).toString()}`;

        const result = await axios({
            method: 'POST',
            url: `${apiUrl}/v1/order${qs}`,
            headers: { 'X-MBX-APIKEY': apiKey },
            timeout: 50000
        });

        return result.data;
    } catch (error) {
        console.error('Erro ao abrir posição:', error.response ? error.response.data : error.message);
    }
}


async function accountInfo() {

    if (!apiKey || !apiSecret)
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');

    const timestamp = await getBinanceTime(); // Aqui usamos o timestamp da Binance
    const recvWindow = 600000;//máximo permitido, default 5000

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${new URLSearchParams({ timestamp, recvWindow }).toString()}`)
        .digest('hex');

    const newData = { timestamp, recvWindow, signature };
    const qs = `?${new URLSearchParams(newData).toString()}`;

    const result = await axios({
        method: 'GET',
        url: `${apiUrl}/v2/account${qs}`,
        headers: { 'X-MBX-APIKEY': apiKey },
        timeout: 50000
    }).catch(err => {
        if (err.response) {
            // O servidor respondeu com um status de erro (fora do intervalo 2xx)
            console.error('Erro de resposta do servidor:', err.response.data);
        } else if (err.request) {
            // A solicitação foi feita, mas não recebeu resposta
            console.error('Sem resposta do servidor:', err.request);
        } else {
            // Ocorreu um erro durante a configuração da solicitação
            console.error('Erro durante a configuração da solicitação:', err.message);
        }
        // Lançar o erro novamente para que ele seja tratado na parte que chama esta função
        throw err;
    });

    const data = { ...result.data };

    data.assets = result.data.assets.filter(item => parseFloat(item.availableBalance) > 0).map(item => {
        return { asset: item.asset, balance: item.availableBalance }
    });

    data.positions = result.data.positions.filter(item => parseFloat(item.positionAmt) !== 0);


    return data;
}



async function getHistoricalCandles(symbol, interval, limit) {
    const params = {
        symbol,
        interval,
        limit,
    };

    const result = await axios({
        method: 'GET',
        url: `${apiUrl}/v1/klines`,
        params,
    }).catch(err => console.error('Erro ao obter velas históricas:', err.response ? err.response.data : err.message));

    return result.data;
}



// esportando das funções 
module.exports = {
    newOrder,
    accountInfo,
    getHistoricalCandles,
}



// const axios = require('axios');

// async function getBinanceTime() {
//     const response = await axios.get('https://api.binance.com/api/v3/time');
//     return response.data.serverTime;
// }

// async function newOrder(symbol, quantity, side = 'BUY', type = 'MARKET', price = 1.00) {
//     try {
//         const data = { symbol, side, type, quantity };
//         const timestamp = await getBinanceTime(); // Aqui usamos o timestamp da Binance

//         // Restante do seu código...
//     } catch (error) {
//         console.error('Erro ao abrir posição:', error.response ? error.response.data : error.message)
//     }
// }
