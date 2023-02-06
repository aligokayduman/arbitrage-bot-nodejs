const axios = require('axios');
const crypto = require('crypto');
const ws = require('ws');
const ReconnectingWebSocket = require('reconnecting-websocket');
const events = require('events');

class BtcTurk {
    #name = 'BtcTurk';
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

    header() {
        const stamp = (new Date()).getTime()
        const data = Buffer.from(`${this.#apiKey}${stamp}`, 'utf8')
        const buffer = crypto.createHmac('sha256', Buffer.from(this.#apiSecret, 'base64')).update(data);
        const digest = buffer.digest()
        const signature = Buffer.from(digest.toString('base64'), 'utf8').toString('utf8')

        return {
            "Content-type": 'application/json',
            "X-PCK": this.#apiKey,
            "X-Stamp": stamp.toString(),
            "X-Signature": signature,
        }
    }  
    
    async fillExchangeInfo() {
        const uri = 'https://api.btcturk.com/api/v2/server/exchangeinfo';
        try {
            const exchange_info = await axios.get(uri);
            const info = exchange_info.data.data.symbols.filter(row => row.name == this.#symbol)[0];
            this.#baseCurrency = info.numerator.trim();
            this.#secondCurrency = info.denominator.trim();     
            this.#buyRound = Math.pow(10, info.denominatorScale);
            this.#sellRound = Math.pow(10, info.numeratorScale);
            
            const msg = this.#name+' Base Currency: '+this.#baseCurrency+' Second Currency: '+this.#secondCurrency;
            return Promise.resolve(msg);          
        } catch (e) {
            const msg = this.#name +' Fill Exchange Info Error: ' + e.code;
            return Promise.reject(msg);
        }

    }    

    async fillWallets() {
        const wallet_uri = 'https://api.btcturk.com/api/v1/users/balances';
        const ticker_uri = 'https://api.btcturk.com/api/v2/ticker?pairSymbol='+this.#symbol;
        const options = { method: 'GET', headers: this.header() };
        try {
            const res_wallet = await axios.get(wallet_uri, options);
            const temp = res_wallet.data.data;
            this.#baseAmount = temp.filter(row => row.asset == this.#baseCurrency)[0].free;
            this.#secondAmount = temp.filter(row => row.asset == this.#secondCurrency)[0].free;
            if(this.#ask == 0){
                const res_ticker = await axios.get(ticker_uri);
                this.#ask = res_ticker.data.data[0].ask;
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
        const currency = (this.#baseCurrency+this.#secondCurrency).toUpperCase();
        this.#ws_connection = new ReconnectingWebSocket('wss://ws-feed-pro.btcturk.com/', [], { WebSocket: ws });        
        const message = '[151,{"type":151, "channel":"ticker","event":"'+currency+'","join":true }]';
    
        this.#ws_connection.onopen = () => { 
            console.log(this.#name+' Starting web socket');
            this.#ws_connection.send(message);
        }
        this.#ws_connection.onclose = () => { this.#ws_connection.reconnect() }
        this.#ws_connection.onmessage = (e) => {
            let data = JSON.parse(e.data);
            if ((data[0] === 402)) {
                if (data[1].A > 0 && data[1].B > 0) {
                    this.#bid = data[1].B;
                    this.#ask = data[1].A;
                    if ((this.#lastBid != this.#bid || this.#lastAsk != this.#ask)) this.eventEmitter.emit('catchedprice'); 
                    this.#lastBid = this.#bid;
                    this.#lastAsk = this.#ask;                    
                }
            }
        }
    }

    async stopWebSocket(){
        this.#ws_connection.onclose = () => { console.log(this.#name+' Stopping web socket'); }        
        this.#ws_connection.close();
        this.eventEmitter.removeAllListeners();               
    }
    
    async Trade(type) {
        let amount;
        if (type == 'BUY') {amount = Math.floor(this.#secondAmount * this.#buyRound) / this.#buyRound;} 
        else {amount = Math.floor(this.#baseAmount * this.#sellRound) / this.#sellRound;}

        const options = {
            method: 'POST',
            url: 'https://api.btcturk.com/api/v1/order',
            headers: this.header(),
            data: {
                quantity: amount,
                newOrderClientId: 'nodejs-request-test',
                orderMethod: 'market',
                orderType: type,
                pairSymbol: this.#symbol
            }
        };
        
        try {
            const response = await axios(options);
            
            if (response.status == 200) {
                const msg = this.#name+' '+type+' : SUCCESS'; //+ (response.data.message).toUpperCase();
                return Promise.resolve(msg); 
            } else {
                const msg = this.#name+' '+type+' : ERROR = '+ response.data.message;
                return Promise.reject(msg);                
            } 
        } catch (e) {
            const msg = this.#name +' '+type+' : AXIOS ERROR = ' + e.code;
            return Promise.reject(msg);
        }
    
    }    
 
}

module.exports = BtcTurk