const axios = require('axios');
const crypto = require('crypto');
const ws = require('ws');
const ReconnectingWebSocket = require('reconnecting-websocket');
const events = require('events');

class Okx {
    #name = 'Okx';
    #apiKey = '';
    #apiSecret = '';
    #apiPassphrase = '';
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

    constructor(apiKey, apiSecret, apiPassphrase, symbol) {
        this.#apiKey = apiKey;
        this.#apiSecret = apiSecret;
        this.#symbol = symbol;
        this.#apiPassphrase = apiPassphrase; 
    }

    header(method, path, body='') {
        const timestamp = (new Date()).toISOString()
        const message = timestamp + method + path + body;
        const signature = crypto
          .createHmac("sha256", this.#apiSecret)
          .update(message)
          .digest("base64");
        return {
          "Content-Type": "application/json",
          "OK-ACCESS-KEY": this.#apiKey,
          "OK-ACCESS-TIMESTAMP": timestamp,
          "OK-ACCESS-SIGN": signature,
          "OK-ACCESS-PASSPHRASE": this.#apiPassphrase
        };
    } 

    async fillExchangeInfo() {
        const uri = 'https://www.okx.com/api/v5/public/instruments?instType=SPOT';
        try {
            const response = await axios.get(uri);
            const info = response.data.data.filter(row => row.instId == this.#symbol)[0];
            this.#baseCurrency = info.baseCcy.trim();
            this.#secondCurrency = info.quoteCcy.trim();
            this.#buyRound = 1;
            this.#sellRound = Math.round(1 / info.lotSz);
            
            const msg = this.#name+' Base Currency: '+this.#baseCurrency+' Second Currency: '+this.#secondCurrency;
            return Promise.resolve(msg);          
        } catch (e) {
            const msg = this.#name +' Fill Exchange Info Error: ' + e.code;
            return Promise.reject(msg);
        }

    }

    async fillWallets() {
        const wallet_uri = 'https://www.okx.com/api/v5/account/balance';
        const ticker_uri = 'https://www.okx.com/api/v5/market/ticker?instId='+this.#symbol;
        const options = { method: 'GET',headers: this.header('GET','/api/v5/account/balance') };
        try {
            const res_wallet = await axios.get(wallet_uri,options);            
            const temp = res_wallet.data.data[0].details;            

            let t_ = temp.filter(row => row.ccy == this.#baseCurrency)[0];
            this.#baseAmount = (typeof t_ === "undefined") ? 0 : t_.eq;            
            t_ = temp.filter(row => row.ccy == this.#secondCurrency)[0];
            this.#secondAmount = (typeof t_ == "undefined") ? 0 : t_.eq;            
            
            if(this.#ask == 0){
                const res_ticker = await axios.get(ticker_uri);
                this.#ask = res_ticker.data.data[0].askPx;
            }            
            this.#activeWallet = (this.#baseAmount > (this.#secondAmount/this.#ask)) ? this.#baseCurrency : (this.#secondAmount != 0) ? this.#secondCurrency : '';
            this.#totalBaseAmount = parseFloat(this.#baseAmount) + (parseFloat(this.#secondAmount) / parseFloat(this.#ask));

            const msg = this.#name+' Balance '+this.#baseCurrency+': '+this.#baseAmount+', '+this.#secondCurrency+': '+this.#secondAmount+' Active Wallet: '+this.#activeWallet; 
            console.log(msg);
            return Promise.resolve(this.#totalBaseAmount);                
        } catch (e) {
            const msg = this.#name +' Get Wallets Error: ' + e;
            return Promise.reject(msg);  
        }

    }  
    
    startWebSocket() {        
        this.#ws_connection = new ReconnectingWebSocket('wss://ws.okx.com:8443/ws/v5/public', [], { WebSocket: ws });
        const message = JSON.stringify({op: "subscribe",args: [{"channel": "tickers","instId": this.#symbol}]});

        this.#ws_connection.onopen = () => { 
            console.log(this.#name+' Starting web socket');
            this.#ws_connection.send(message);
        }

        this.#ws_connection.onclose = () => { this.#ws_connection.reconnect() }
        this.#ws_connection.onmessage = (e) => {
            let data = JSON.parse(e.data);
            if (data.hasOwnProperty('data')) {
                this.#bid = data.data[0].bidPx;
                this.#ask = data.data[0].askPx;
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

        let amount,side;
        if (type == 'BUY') {amount = Math.floor(this.#secondAmount * this.#buyRound) / this.#buyRound;side='buy';} 
        else {amount = Math.floor(this.#baseAmount * this.#sellRound) / this.#sellRound;side='sell';}

        const body = JSON.stringify({
            instId: this.#symbol,
            tdMode: "cash",
            side: side,
            ordType: "market",          
            sz: amount.toString()
          });        
        
        const options = { method: 'POST',headers: this.header('POST','/api/v5/trade/order',body) };

        try {
            const response = await axios.post('https://www.okx.com/api/v5/trade/order',body,options);

            if (response.data.code == 0) {
                const msg = this.#name+' '+type+' : SUCCESS'; //+ (response.data.data[0].sMsg).toUpperCase();;
                return Promise.resolve(msg); 
            } else {
                const msg = this.#name+' '+type+' : ERROR = '+ response.data.data[0].sMsg;
                return Promise.reject(msg);                
            }  
        } catch (e) {
            const msg = this.#name +' '+type+' : AXIOS ERROR = ' + e;
            return Promise.reject(msg);
        }
    
    }    
 
}

module.exports = Okx