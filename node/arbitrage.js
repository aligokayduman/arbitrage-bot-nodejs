const axios = require('axios');
const fs = require('fs');
const exchange = require('./model/exchange.js');
const events = require('events');

let status = true;
let onInitialize = false;
let onCheck = false;

let leftExchange = null;
let rightExchange = null;
let settings;

let leftExchangeName = ''; 
let leftExchangeApiKey = '';
let leftExchangeApiSecret = '';
let leftExchangeApiPassphrase = '';
let leftExchangeSymbol = '';

let rightExchangeName = ''; 
let rightExchangeApiKey = '';
let rightExchangeApiSecret = '';
let rightExchangeApiPassphrase = '';
let rightExchangeSymbol = '';

let showPrices = 'false';
let showDiff = 'false';
let minDiff = 0;
let arbitrageCount = 1;

async function leftExchangeChangedPrice() {
    if(showPrices == 'true') console.log(leftExchange.getName()," Prices (bid,ask): ",leftExchange.getBid(),leftExchange.getAsk());
    checkArbitraj();
}
async function rightExchangeChangedPrice() {
    if(showPrices == 'true') console.log(rightExchange.getName()," Prices (bid,ask): ",rightExchange.getBid(),rightExchange.getAsk());
    checkArbitraj();
}  

async function createExchanges() {       
    console.log('Start creating exchanges');

    leftExchange = exchange.createExchange(leftExchangeName, leftExchangeApiKey, leftExchangeApiSecret, leftExchangeApiPassphrase, leftExchangeSymbol);
    rightExchange = exchange.createExchange(rightExchangeName ,rightExchangeApiKey, rightExchangeApiSecret, rightExchangeApiPassphrase, rightExchangeSymbol);
}

async function checkArbitraj() {

    if(!status || onCheck) return;
    if (rightExchange.getBid() == 0 || rightExchange.getAsk() == 0 || leftExchange.getBid() == 0 || leftExchange.getAsk() == 0) return;
        
    let diff = ((rightExchange.getBid()/leftExchange.getAsk()) - 1).toFixed(5);
    if (diff > minDiff) {
        if ( (leftExchange.getActiveWallet() != leftExchange.getSecondCurrency()) ||
             (rightExchange.getActiveWallet() != rightExchange.getBaseCurrency()) ) return;
        const pOrder1 = new Promise((resolve, reject) => { resolve(leftExchange.Trade('BUY')) });
        const pOrder2 = new Promise((resolve, reject) => { resolve(rightExchange.Trade('SELL')) });
        if(!status || onCheck) return; else onCheck = true;           
        Promise.all([pOrder1, pOrder2]).then((orders) => {
            console.log(orders);           
            const pWallet1 = new Promise((resolve, reject) => { resolve(leftExchange.fillWallets()) });
            const pWallet2 = new Promise((resolve, reject) => { resolve(rightExchange.fillWallets()) });
            Promise.all([pWallet1, pWallet2]).then((amounts) => {
                const totalAmount = parseFloat(amounts[0])+parseFloat(amounts[1]);
                sendTelegramMessage(arbitrageCount+'. Arbitrage \n\r'+orders[0]+'\n\r'+orders[1]+'\n\rFinal'+leftExchange.getBaseCurrency()+' Amount: '+totalAmount);               
                onCheck = false;
                arbitrageCount++;
            }).catch((error) => {
                console.log(error);
                status = false;
                console.log('On Status: Stop, Please check settings/logs');                
            });           
        }).catch((error) => {
            console.log(error);
            sendTelegramMessage(error);
            status = false;
            console.log('On Status: Stop, Please check settings/logs');                
        });
        const msg = rightExchange.getName()+' Bid: '+rightExchange.getBid().replace(/0+$/,'')+' -> '+leftExchange.getName()+' Ask: '+leftExchange.getAsk().replace(/0+$/,'')+' Diff: % '+String(Math.round(diff*100000)/100000).replace(/0+$/,'');
        console.log(msg);         
    }
    if(diff > 0 && showDiff=='true') {
        const msg = getTime()+' '+rightExchange.getName()+' Bid: '+rightExchange.getBid().replace(/0+$/,'')+' -> '+leftExchange.getName()+' Ask: '+leftExchange.getAsk().replace(/0+$/,'')+' Diff: % '+String(Math.round(diff*100000)/100000).replace(/0+$/,'');
        console.log(msg);
    }    

    diff = ((leftExchange.getBid()/rightExchange.getAsk()) - 1).toFixed(5);
    if (diff > minDiff) {
        if ( (leftExchange.getActiveWallet() != leftExchange.getBaseCurrency()) ||
             (rightExchange.getActiveWallet() != rightExchange.getSecondCurrency()) ) return;
        const promise1 = new Promise((resolve, reject) => { resolve(rightExchange.Trade('BUY')) });
        const promise2 = new Promise((resolve, reject) => { resolve(leftExchange.Trade('SELL')) });
        if(!status || onCheck) return; else onCheck = true;
        Promise.all([promise1, promise2]).then((orders) => {
            console.log(orders);            
            const pWallet1 = new Promise((resolve, reject) => { resolve(leftExchange.fillWallets()) });
            const pWallet2 = new Promise((resolve, reject) => { resolve(rightExchange.fillWallets()) });
            Promise.all([pWallet1, pWallet2]).then((amounts) => {
                const totalAmount = parseFloat(amounts[0])+parseFloat(amounts[1]);
                sendTelegramMessage(arbitrageCount+'. Arbitrage \n\r'+orders[0]+'\n\r'+orders[1]+'\n\rFinal '+leftExchange.getBaseCurrency()+' Amount: '+totalAmount);               
                onCheck = false;
                arbitrageCount++;
            }).catch((error) => {
                console.log(error);
                status = false;
                console.log('On Status: Stop, Please check settings/logs');                
            }); 
        }).catch((error) => {
            console.log(error);
            sendTelegramMessage(error);
            status = false;
            console.log('On Status: Stop, Please check settings/logs');
        });
        const msg = leftExchange.getName()+' Bid: '+leftExchange.getBid().replace(/0+$/,'')+' -> '+rightExchange.getName()+' Ask: '+rightExchange.getAsk().replace(/0+$/,'')+' Diff: % '+String(Math.round(diff*100000)/100000).replace(/0+$/,'');
        console.log(msg);       
    }
    if(diff > 0 && showDiff=='true') {
        const msg = getTime()+' '+leftExchange.getName()+' Bid: '+leftExchange.getBid().replace(/0+$/,'')+' -> '+rightExchange.getName()+' Ask: '+rightExchange.getAsk().replace(/0+$/,'')+' Diff: % '+String(Math.round(diff*100000)/100000).replace(/0+$/,'');
        console.log(msg);
    }
   
}

async function getSettings() {
    try {
        settings = JSON.parse(fs.readFileSync('./settings.json', { encoding: 'utf8', flag: 'r' }));
        await checkSettings();      
        console.log('Settings Loaded');
    } catch (error) {
        console.log('can not read settings, Please check settings/logs :'+error);
        status = false;
    }

}

async function checkSettings() {
    if (settings.arbitrage["status"] == 'Stop') {
        if(status) console.log('On Status: Stop, Please check settings/logs');
        status = false;
    }else{
        status = true;
    }

    let init = false;
    let badSetting = false;
    if(settings.arbitrage["leftExchange"] != leftExchangeName) {leftExchangeName = settings.arbitrage["leftExchange"];init = true;}
    if(settings.arbitrage["leftApiKey"] != leftExchangeApiKey) {leftExchangeApiKey = settings.arbitrage["leftApiKey"];init = true;}
    if(settings.arbitrage["leftApiSecret"] != leftExchangeApiSecret) {leftExchangeApiSecret = settings.arbitrage["leftApiSecret"];init = true;}
    if(settings.arbitrage["leftApiPassphrase"] != leftExchangeApiPassphrase) {leftExchangeApiPassphrase = settings.arbitrage["leftApiPassphrase"];init = true;}
    if(settings.arbitrage["leftSymbol"] != leftExchangeSymbol) {leftExchangeSymbol = settings.arbitrage["leftSymbol"];init = true;}

    if(settings.arbitrage["rightExchange"] != rightExchangeName) {rightExchangeName = settings.arbitrage["rightExchange"];init = true;}
    if(settings.arbitrage["rightApiKey"] != rightExchangeApiKey) {rightExchangeApiKey = settings.arbitrage["rightApiKey"];init = true;}
    if(settings.arbitrage["rightApiSecret"] != rightExchangeApiSecret) {rightExchangeApiSecret = settings.arbitrage["rightApiSecret"];init = true;}
    if(settings.arbitrage["rightApiPassphrase"] != rightExchangeApiPassphrase) {rightExchangeApiPassphrase = settings.arbitrage["rightApiPassphrase"];init = true;}
    if(settings.arbitrage["rightSymbol"] != rightExchangeSymbol) {rightExchangeSymbol = settings.arbitrage["rightSymbol"];init = true;}
    
    if(settings.arbitrage["minDiff"] != minDiff) {minDiff = settings.arbitrage["minDiff"];}

    if(leftExchangeName == '' | leftExchangeApiKey == '' || leftExchangeApiSecret == '' || leftExchangeSymbol == '' ||
       rightExchangeName == '' | rightExchangeApiKey == '' || rightExchangeApiSecret == '' || rightExchangeSymbol == '' || minDiff == '') badSetting = true;

    if(leftExchangeName == rightExchangeName || removesplitter(leftExchangeSymbol) != removesplitter(rightExchangeSymbol) || parseFloat(minDiff)<0) badSetting = true;  
    
    if(settings.arbitrage["showPrices"] != showPrices) {showPrices = settings.arbitrage["showPrices"];}
    if(settings.arbitrage["showDiff"] != showDiff) {showDiff = settings.arbitrage["showDiff"];}
    

    if(init){
        if(!badSetting){
            console.log('First initializing or Setting changed');
            try {
                await initialize();
            } catch (error) {
                status = false;
                console.log('On Status: Stop, Please check settings/logs');                
            }
            
        }else{
            console.log('Bad settings, Please check settings/logs');
        }
    }

}

async function initialize(){
    console.log('Start initializing');

    if(leftExchange != null) await leftExchange.stopWebSocket();
    if(rightExchange != null) await rightExchange.stopWebSocket();

    await createExchanges();

    await leftExchange.fillExchangeInfo();
    await leftExchange.fillWallets();

    await rightExchange.fillExchangeInfo();
    await rightExchange.fillWallets();

    leftExchange.startWebSocket();
    rightExchange.startWebSocket();

    leftExchange.eventEmitter.on('catchedprice', leftExchangeChangedPrice);
    rightExchange.eventEmitter.on('catchedprice', rightExchangeChangedPrice);

}

async function writeSetting(){
    try {
        fs.writeFileSync("settings.json",JSON.stringify(settings,null,2));
        console.log('settings Updateded');
    } catch (error) {
        console.log('can not update settings: '+error);    
    }
    
}

async function sendTelegramMessage(message) {
    try {
        const token = settings.telegram["botToken"];
        const chatID = settings.telegram["chatId"];

        if(token == '' || chatID == '') {console.log('Check telegram settings ');return;}

        try {
            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            const response = await axios.post(url, {
                chat_id: chatID,
                text: message
            });
        } catch (error) {
            console.error('Telegram Error: ' + error.code);
        }
    } catch (error) {
        console.log('Check telegram settings: '+error.code);
    }
}

function getTime(){
    const date = new Date();
    return date.getFullYear() +'.'+("0" + (date.getMonth() + 1)).slice(-2) +'.'+ ("0" + date.getDate()).slice(-2) +' '+ ("0" + date.getHours() ).slice(-2) +':'+ ("0" + date.getMinutes()).slice(-2) +':'+ ("0" + date.getSeconds()).slice(-2);    
}

function removesplitter(str) {
    return str.replace('-','').replace('_','');
}

async function main() {

    await getSettings();
    setInterval(() => { getSettings() }, 30000);

};

main();