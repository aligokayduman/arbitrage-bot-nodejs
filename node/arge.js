const axios = require('axios');
const fs = require('fs');
const ws = require('ws');
const ReconnectingWebSocket = require('reconnecting-websocket');

const leftName = 'BinanceTR';
let leftBid = 0;
let leftAsk = 0;

const rightName = 'BtcTurk';
let rightBid = 0;
let rightAsk = 0;

let biggestDiffLeft = 0;
let biggestDiffRight = 0;

let minDiff = 0.004;
let decimal = 5;
let sending = false;
const telegramTimeout = 1000;

let settings;

async function getSettings() {
    try {
        settings = JSON.parse(fs.readFileSync('./settings.json', { encoding: 'utf8', flag: 'r' }));
        console.log('Settings Loaded');
    } catch (error) {
        console.log('can not read settings, Please check settings/logs :'+error);
    }
}

async function writeLog(message){
    fs.appendFile("arge.txt", message+"\r\n", (err) => {
        if (err) console.log(err);        
      });
}

async function sendTelegramMessage (message) {
    if(sending == true) return;
    sending = true;
    setTimeout(() =>{sending = false;},telegramTimeout);

    const token = settings.telegram["botToken"];
    const chatID = settings.telegram["chatId"];
    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const response = await axios.post(url, {
          chat_id: chatID,
        text: message
      });
    } catch (error) {
      console.error('Telegram Error: '+error.code);
    }
  }

async function analyze(){
    if(leftBid == 0 || leftAsk == 0 || rightBid == 0 || rightAsk == 0) return;
    
    if (leftBid > rightAsk) {
        const diff = ((leftBid/rightAsk) - 1);

        if(diff > biggestDiffLeft) biggestDiffLeft = diff;

        if(diff > minDiff) {
            const msg = leftName+' Bid: '+leftBid.replace(/0+$/,'')+' -> '+rightName+' Ask: '+rightAsk.replace(/0+$/,'')+' Diff: % '+diff.toFixed(decimal).replace(/0+$/,'')+' Biggest Diff: %'+biggestDiffLeft.toFixed(decimal).replace(/0+$/,'');
            console.log(msg);
            sendTelegramMessage(msg);
            writeLog(msg);
        }
    }

    if (rightBid > leftAsk) {
        const diff = ((rightBid/leftAsk) - 1);

        if(diff > biggestDiffRight) biggestDiffRight = diff;

        if(diff > minDiff) {
            const msg = rightName+' Bid: '+rightBid.replace(/0+$/,'')+' -> '+leftName+' Ask: '+leftAsk.replace(/0+$/,'')+' Diff: % '+diff.toFixed(decimal).replace(/0+$/,'')+' Biggest Diff: %'+biggestDiffRight.toFixed(decimal).replace(/0+$/,'');
            console.log(msg);
            sendTelegramMessage(msg);
            writeLog(msg);
            biggestDiffBtcTurk = diff;
        }
    }

}

//left
function startBinanceTRWebSocket() {
    const connection = new ReconnectingWebSocket('wss://stream-cloud.trbinance.com/ws/usdttry@ticker', [], { WebSocket: ws });
    connection.onopen = () => { connection.send(JSON.stringify({ method: 'SUBSCRIBE', id: 1, params: ["usdttry@ticker@100ms"] })); }
    connection.onclose = () => { connection.reconnect() }
    connection.onmessage = (data) => {
        let temp = JSON.parse(data.data);
        if (temp.b > 0 && temp.a > 0) {
            leftBid = temp.b;
            leftAsk = temp.a;
            analyze();
        }
    }
}


//right
function startBtcTurkWebSocket() {
    const connection = new ReconnectingWebSocket('wss://ws-feed-pro.btcturk.com/', [], { WebSocket: ws });
    const message = `[151,{"type":151, "channel":"ticker","event":"USDTTRY","join":true }]`

    connection.onopen = () => { connection.send(message) }
    connection.onclose = () => { connection.reconnect() }
    connection.onmessage = (e) => {
        let data = JSON.parse(e.data);
        if ((data[0] === 402)) {
            if (data[1].A > 0 && data[1].B > 0) {
                rightBid = data[1].B;
                rightAsk = data[1].A;
                analyze();                    
            }
        }
    }
}

async function main() {
    await getSettings()
    startBinanceTRWebSocket();
    startBtcTurkWebSocket();
}

main();