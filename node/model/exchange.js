const BinanceTR = require('./binanceTR.js');
const BtcTurk = require('./btcTurk.js');
const Binance = require('./binance.js');
const Okx = require('./okx.js');

let exchange = null;

function createExchange(name, apiKey, apiSecret, apiPassphrase, symbol){
    if(name == 'BinanceTR') exchange = new BinanceTR(apiKey, apiSecret, symbol);
    if(name == 'BtcTurk') exchange = new BtcTurk(apiKey, apiSecret, symbol);
    if(name == 'Binance') exchange = new Binance(apiKey, apiSecret, symbol);
    if(name == 'Okx') exchange = new Okx(apiKey, apiSecret, apiPassphrase, symbol);

    return exchange;
}

module.exports = {createExchange}