// medias.js
const { SMA } = require('technicalindicators');

function calcularSMA(values, periodo) {
    return SMA.calculate({ period: periodo, values });
}

module.exports = {
    calcularSMA
};
