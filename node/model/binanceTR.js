const axios = require('axios');
const crypto = require('crypto');
const ws = require('ws');
const ReconnectingWebSocket = require('reconnecting-websocket');
const events = require('events');

class BinanceTR {
    #name = 'BinanceTR';
    #apiKey = '';
    #apiSecret = '';
    #symbol = '';
    #baseCurrency = '';
    #secondCurrency = '';    
    #baseAmount = 0;
    #secondAmount = 0;
    #totalBaseAmount = 0;
    #buyRound = 0;
    #sellRound = 0;
    #bid = 0;
    #ask = 0;
    #activeWallet = '';
    #lastBid = 0;
    #lastAsk = 0;
    #ws_connection = null;

    eventEmitter = new events.EventEmitter();

    getBid(){return this.#bid;}
    getAsk(){return this.#bid;}
    getName(){return this.#name;}
    getActiveWallet(){return this.#activeWallet;}
    getBaseCurrency(){return this.#baseCurrency;}
    getSecondCurrency(){return this.#secondCurrency;}      

    constructor(apiKey, apiSecret, symbol) {
        this.#apiKey = apiKey;
        this.#apiSecret = apiSecret;
        this.#symbol = symbol;
    }

    async fillExchangeInfo() {
        const uri = 'https://www.trbinance.com/open/v1/common/symbols';
        try {
            const common_symbols = await axios.get(uri);
            const info = common_symbols.data.data.list.filter(row => row.symbol == this.#symbol)[0];
            this.#baseCurrency = info.baseAsset.trim();
            this.#secondCurrency = info.quoteAsset.trim();
            this.#buyRound = 1;
            this.#sellRound = Math.round(1 / info.filters.filter(r => r.filterType == 'LOT_SIZE')[0].stepSize);
            const msg = this.#name+' Base Currency: '+this.#baseCurrency+' Second Currency: '+this.#secondCurrency;
            console.log(msg);
            return Promise.resolve(msg);          
        } catch (e) {
            const msg = this.#name +' Fill Exchange Info Error: ' + e.code;
            return Promise.reject(msg);
        }

    }    

    async fillWallets() {
        const wallet_uri = 'https://www.trbinance.com/open/v1/account/spot';
        const ticker_uri = 'https://api.binance.me/api/v1/klines?symbol='+this.#baseCurrency+this.#secondCurrency+'&interval=1m';
        const timestamp = Date.now();
        const signature = crypto.createHmac('sha256', this.#apiSecret).update(`timestamp=${timestamp}`).digest('hex');
        try {
            const res_wallet = await axios.get(wallet_uri, { params: { timestamp, signature: signature }, headers: { 'X-MBX-APIKEY': this.#apiKey } });
            const temp = res_wallet.data.data.accountAssets;  
            this.#baseAmount = temp.filter(row => row.asset == this.#baseCurrency)[0].free;
            this.#secondAmount = temp.filter(row => row.asset == this.#secondCurrency)[0].free;

            if(this.#ask == 0){
                const res_ticker = await axios.get(ticker_uri);
                this.#ask = res_ticker.data[0][4];
            }                        
            this.#activeWallet = (this.#baseAmount > (this.#secondAmount/this.#ask)) ? this.#baseCurrency : (this.#secondAmount != 0) ? this.#secondCurrency : '';       
            this.#totalBaseAmount = parseFloat(this.#baseAmount) + (parseFloat(this.#secondAmount) / parseFloat(this.#ask));

            const msg = this.#name+' Balance '+this.#baseCurrency+': '+this.#baseAmount+', '+this.#secondCurrency+': '+this.#secondAmount+' Active Wallet: '+this.#activeWallet; 
            return Promise.resolve(this.#totalBaseAmount);                
        } catch (e) {
            const msg = this.#name +' Get Wallets Error: ' + e.code;
            return Promise.reject(msg); 
        }

    }
    
    startWebSocket() {        
        const currency = (this.#baseCurrency+this.#secondCurrency).toLowerCase();
        this.#ws_connection = new ReconnectingWebSocket('wss://stream-cloud.trbinance.com/ws/'+currency+'@ticker', [], { WebSocket: ws });
        const message = JSON.stringify({ method: 'SUBSCRIBE', id: 1, params: [currency+"@ticker@100ms"] });

        this.#ws_connection.onopen = () => { 
            console.log(this.#name+' Starting web socket');
            this.#ws_connection.send(message);
        }

        this.#ws_connection.onclose = () => { this.#ws_connection.reconnect() }
        this.#ws_connection.onmessage = (data) => {
            let temp = JSON.parse(data.data);
            if (temp.b > 0 && temp.a > 0) {
                this.#bid = temp.b;
                this.#ask = temp.a;
                if ((this.#lastBid != this.#bid || this.#lastAsk != this.#ask)) this.eventEmitter.emit('catchedprice'); 
                this.#lastBid = this.#bid;
                this.#lastAsk = this.#ask;                
            }
        }
    }

    async stopWebSocket(){
        this.#ws_connection.onclose = () => { console.log(this.#name+' Stopping web socket'); }
        this.#ws_connection.close();
        this.eventEmitter.removeAllListeners();        
    }    
    
    async Trade(type) {
        let amount,side,signature,params;

        const timestamp = Date.now();
        if (type == 'BUY'){
            side = 0;
            amount = Math.floor(this.#secondAmount * this.#buyRound) / this.#buyRound;
            signature = crypto.createHmac('sha256', this.#apiSecret).update(`symbol=${this.#symbol}&side=${side}&type=${2}&quoteOrderQty=${amount}&timestamp=${timestamp}`).digest('hex');
            params = new URLSearchParams({ 'symbol':this.#symbol , side, 'type': 2, 'quoteOrderQty': amount, timestamp, signature });
        }
        else{
            side = 1
            amount = Math.floor(this.#baseAmount * this.#sellRound) / this.#sellRound;
            signature = crypto.createHmac('sha256', this.#apiSecret).update(`symbol=${this.#symbol}&side=${side}&type=${2}&quantity=${amount}&timestamp=${timestamp}`).digest('hex');
            params = new URLSearchParams({ 'symbol':this.#symbol , side, 'type': 2, 'quantity': amount, timestamp, signature });
        }        
    
        try {
            const response = await axios.post('https://www.trbinance.com/open/v1/orders', params, { headers: { 'X-MBX-APIKEY': this.#apiKey } });

            if (response.data.code == 0) {
                const msg = this.#name+' '+type+' : SUCCESS'; //+(response.data.msg).toUpperCase();
                return Promise.resolve(msg); 
            } else {
                const msg = this.#name+' '+type+' : ERROR = '+response.data.msg;
                return Promise.reject(msg);                
            }                   
        } catch (e) {
            const msg = this.#name+' '+type+' : AXIOS ERROR = '+e;
            return Promise.reject(msg);
        }
        
    }    
 
}

module.exports = BinanceTR