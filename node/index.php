<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Arbitraj Bot</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon"> 
  </head>
  <body>
    <div class="container">
        <p class="text-center">
            <button class="btn btn-primary mt-2" type="button" data-toggle="collapse" data-target="#apiPanel" aria-expanded="false" aria-controls="apiPanel" onclick="$('#apiPanel').collapse('toggle');">
                Api Keys
            </button>
        </p>        
        <div class="collapse" id="apiPanel">
            <div class="card mb-1">
                <div class="card-body">
                    <div class="row"><div class="col-md-12 text-center "><h6>Api Access</h6></div> </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="row">
                            <div class="col-md-12"><h6>BinanceTR</h6></div>                                                        
                                <div class="col-md-12 mb-1">
                                    <input type="text" id="binancetr_apiKey" name="binancetr_apiKey" class="form-control" value="" placeholder="ApiKey">
                                </div>
                                <div class="col-md-12 mb-1">
                                    <input type="text" id="binancetr_apiSecret" name="binancetr_apiSecret" class="form-control" value="" placeholder="ApiSecret">
                                </div>                            
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="row">
                                <div class="col-md-12"><h6>BtcTurk</h6></div>                            
                                <div class="col-md-12 mb-1">
                                    <input type="text" id="btcturk_apiKey" name="btcturk_apiKey" class="form-control" value=""  placeholder="ApiKey">
                                </div>
                                <div class="col-md-12 mb-1">  
                                    <input type="text" id="btcturk_apiSecret" name="btcturk_apiSecret" class="form-control" value="" placeholder="ApiSecret">
                                </div>                            
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="row">
                                <div class="col-md-12"><h6>Binance</h6></div>                            
                                <div class="col-md-12 mb-1">
                                    <input type="text" id="binance_apiKey" name="binance_apiKey" class="form-control" value=""  placeholder="ApiKey">
                                </div>
                                <div class="col-md-12 mb-1">  
                                    <input type="text" id="binance_apiSecret" name="binance_apiSecret" class="form-control" value="" placeholder="ApiSecret">
                                </div>                            
                            </div>
                        </div> 
                        <div class="col-md-6">
                            <div class="row">
                                <div class="col-md-12"><h6>Okx</h6></div>                            
                                <div class="col-md-12 mb-1">
                                    <input type="text" id="okx_apiKey" name="okx_apiKey" class="form-control" value=""  placeholder="ApiKey">
                                </div>
                                <div class="col-md-12 mb-1">  
                                    <input type="text" id="okx_apiSecret" name="okx_apiSecret" class="form-control" value="" placeholder="ApiSecret">
                                </div>                            
                                <div class="col-md-12 mb-1">  
                                    <input type="text" id="okx_apiPassphrase" name="okx_apiPassphrase" class="form-control" value="" placeholder="ApiPassphrase">
                                </div>                                 
                            </div>
                        </div>                                                      
                    </div>
                </div>
            </div>
        </div>       
        <div class="card">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-4">
                        <h5 class="text-center">Arbitrage</h5>
                        <div class="d-flex mb-1">
                            <label style="width:100px;" for="status" class="col-form-label me-1">Status</label>
                            <select style="width:200px;" class="form-select" id="status"><option value="Start">Start</option><option value="Stop">Stop</option></select>
                        </div>
                        <div class="d-flex mb-1">
                            <label style="width:100px;" for="status" class="col-form-label me-1">show Prices</label>
                            <input type="checkbox" class="form-check-input" id="showPrices">
                        </div> 
                        <div class="d-flex mb-1">
                            <label style="width:100px;" for="status" class="col-form-label me-1">show Diff</label>
                            <input type="checkbox" class="form-check-input" id="showDiff">
                        </div>                                                
                        <div class="d-flex mb-1">
                            <label style="width:100px;" for="minDiff" class="col-form-label me-1">Min Diff.</label>
                            <div class="input-group" style="width:200px;">
                                <input type="number" step="0.001" class="form-control" id="minDiff" value="">
                            </div>
                        </div>
                        <div class="d-flex mb-1">
                            <label style="width:100px;" for="telegram_botToken" class="col-form-label me-1">Tel.Key</label>
                            <input type="text" id="telegram_botToken" class="form-control" value="">
                        </div>
                        <div class="d-flex mb-1">
                            <label style="width:100px;" for="telegram_chatId" class="col-form-label me-1">Tel.ChatID</label>
                            <input type="text" id="telegram_chatId" class="form-control" value="">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <h5 class="text-center">Exchange-1</h5>
                        <div class="d-flex mb-1">
                            <select id="leftExchange" name="leftExchange" class="form-select" aria-label="Exchanges" placeholder="Exchanges">
                                <option value="">Exchanges</option>
                                <option value="BinanceTR">BinanceTR</option>
                                <option value="BtcTurk">BtcTurk</option>
                                <option value="Binance">Binance</option>
                                <option value="Okx">Okx</option>                                
                            </select>                            
                        </div>
                        <div class="d-flex mb-1">
                            <label for="leftSymbol" class="col-form-label me-1">Symbol</label>
                            <select style="width:200px;" class="form-select" id="leftSymbol"></select>
                        </div>
                    </div>
                    <div class="col-md-4">
                    <h5 class="text-center">Exchange-2</h5>
                    <div class="d-flex mb-1">
                            <select id="rightExchange" name="rightExchange" class="form-select" aria-label="Exchanges" placeholder="Exchanges">
                                <option value="">Exchanges</option>
                                <option value="BinanceTR">BinanceTR</option>
                                <option value="BtcTurk">BtcTurk</option>
                                <option value="Binance">Binance</option>
                                <option value="Okx">Okx</option>
                            </select>                            
                        </div>
                        <div class="d-flex mb-1">
                            <label for="rightSymbol" class="col-form-label me-1">Symbol</label>
                            <select style="width:200px;" class="form-select" id="rightSymbol"></select>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <p class="text-center"><button class="btn btn-danger" type="button" id="btn_save" name="btn_save">Save</button></p>
                </div>
                
            </div>
        </div>
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Services</h5>
                <p id="trades" class="card-text">
                    <?php
                    $handle = fopen("services.log", "r");
                    if ($handle) {
                        while (($line = fgets($handle)) !== false) {
                            if(strpos($line,' Exit ') && strpos($line,' node ')) echo "<font color='red'>".$line."</font><br />";
                            if(strpos($line,' Up ') && strpos($line,' node ')) echo "<font color='green'>".$line."</font><br />";
                            else echo "<font color='black'>".$line."</font><br />";
                        }
                        fclose($handle);
                    }
                    ?>
                </p>
            </div>
        </div>        
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Logs (Last 1000 line)</h5>
                <p id="trades" class="card-text">
                    <?php
                    $handle = fopen("arbitrage.log", "r");
                    if ($handle) {
                        while (($line = fgets($handle)) !== false) {
                            echo $line."<br />";
                        }
                        fclose($handle);
                    }
                    ?>
                </p>
            </div>
        </div>

    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.3/jquery.min.js" integrity="sha512-STof4xm1wgkfm7heWqFJVn58Hm3EtS31XFaagaa8VMReCXAkQnJZ+jEy8PCC/iT18dFy95WcExNHFTqLyp72eQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>    
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<script>

function overLink(){
    alert(this);
}

$(document).ready(function($) {
    $.ajaxSetup({ cache: false });

    let settings ={};
    let binanceTemp = '';
    let binanceTRTemp = '';
    let btcTurkTemp = '';
    let okxTemp = '';

    getSymbols = function(name='') {

        if (name === 'BtcTurk'){
            if(btcTurkTemp == ''){
                btcTurkTemp = '<option></option>'; 
                const exchangeinfo = JSON.parse(`<?php echo file_get_contents('https://api.btcturk.com/api/v2/server/exchangeinfo') ?>`).data.symbols;        
                exchangeinfo.forEach(r=>{ btcTurkTemp +=`<option value="${r.name}">${r.name}</opton>` });
            }
            return btcTurkTemp;
        }

        if (name === 'BinanceTR'){
            if(binanceTRTemp == ''){
                binanceTRTemp ='<option></option>'; 
                const exchangeinfo = JSON.parse(`<?php echo file_get_contents('https://www.trbinance.com/open/v1/common/symbols') ?>`).data.list;        
                exchangeinfo.forEach(r=>{ binanceTRTemp +=`<option value="${r.symbol}">${r.symbol}</opton>` });
            }
            return binanceTRTemp;
        }
        
        if (name === 'Binance'){
            if(binanceTemp == ''){
                binanceTemp = '<option></option>'; 
                const exchangeinfo = JSON.parse(`<?php echo file_get_contents('https://api.binance.com/api/v1/exchangeInfo') ?>`).symbols;        
                exchangeinfo.forEach(r=>{ binanceTemp +=`<option value="${r.symbol}">${r.symbol}</opton>` });
            }
            return binanceTemp;
        }
        
        if (name === 'Okx'){
            if(okxTemp == ''){
                okxTemp = '<option></option>'; 
                const exchangeinfo = JSON.parse(`<?php echo file_get_contents('https://www.okx.com/api/v5/public/instruments?instType=SPOT') ?>`).data;        
                exchangeinfo.forEach(r=>{ okxTemp +=`<option value="${r.instId}">${r.instId}</opton>` });
            }
            return okxTemp;
        }         
    }

    $('#leftExchange').change(function(event) {
        const symbols = getSymbols($('#leftExchange').find(":selected").text());
        $('#leftSymbol').html(symbols).select2();
    });

    $('#rightExchange').change(function(event) {
        const symbols = getSymbols($('#rightExchange').find(":selected").text());
        $('#rightSymbol').html(symbols).select2();
    });    

    $.getJSON("settings.json?abc="+Math.random(), function(data) {
        settings = data;
        $('#binancetr_apiKey').val(settings.binancetr.apiKey);
        $('#binancetr_apiSecret').val(settings.binancetr.apiSecret);

        $('#btcturk_apiKey').val(settings.btcturk.apiKey);
        $('#btcturk_apiSecret').val(settings.btcturk.apiSecret);

        $('#binance_apiKey').val(settings.binance.apiKey);
        $('#binance_apiSecret').val(settings.binance.apiSecret);
        
        $('#okx_apiKey').val(settings.okx.apiKey);
        $('#okx_apiSecret').val(settings.okx.apiSecret);
        $('#okx_apiPassphrase').val(settings.okx.apiPassphrase);                

        $('#minDiff').val(settings.arbitrage.minDiff);
        $('#telegram_botToken').val(settings.telegram.botToken);
        $('#telegram_chatId').val(settings.telegram.chatId);
        $('#status option[value="'+settings.arbitrage.status+'"]').attr('selected', true);
        if(settings.arbitrage.showPrices === 'true') $('#showPrices').attr('checked', true);
        if(settings.arbitrage.showDiff === 'true') $('#showDiff').attr('checked', true);
        
        $('#leftExchange option[value="'+settings.arbitrage.leftExchange+'"]').attr('selected', true).trigger("change");
        $('#leftSymbol').val(settings.arbitrage.leftSymbol).trigger('change');
        $('#rightExchange option[value="'+settings.arbitrage.rightExchange+'"]').attr('selected', true).trigger("change");
        $('#rightSymbol').val(settings.arbitrage.rightSymbol).trigger('change');
        console.log(settings);
    }).fail(function() {
        console.log( "settings.json can not be read" );
    });

    getApiKey = function (name) {
        if(name === 'BinanceTR') return settings.binancetr.apiKey;
        if(name === 'BtcTurk') return settings.btcturk.apiKey;
        if(name === 'Binance') return settings.binance.apiKey;
        if(name === 'Okx') return settings.okx.apiKey;
    }

    getApiSecret = function (name) {
        if(name === 'BinanceTR') return settings.binancetr.apiSecret;
        if(name === 'BtcTurk') return settings.btcturk.apiSecret;
        if(name === 'Binance') return settings.binance.apiSecret;
        if(name === 'Okx') return settings.okx.apiSecret;
    }
    
    getApiPassphrase = function (name) {
        if(name === 'Okx') return settings.okx.apiPassphrase;
        return '';
    }    

    $("#btn_save").click(function(){
        settings.binancetr.apiKey = $("#binancetr_apiKey").val();
        settings.binancetr.apiSecret = $("#binancetr_apiSecret").val();

        settings.btcturk.apiKey = $("#btcturk_apiKey").val();
        settings.btcturk.apiSecret = $("#btcturk_apiSecret").val();        

        settings.binance.apiKey = $("#binance_apiKey").val();
        settings.binance.apiSecret = $("#binance_apiSecret").val();

        settings.okx.apiKey = $("#okx_apiKey").val();
        settings.okx.apiSecret = $("#okx_apiSecret").val();
        settings.okx.apiPassphrase = $("#okx_apiPassphrase").val();        

        settings.arbitrage.minDiff = $("#minDiff").val();
        settings.telegram.botToken = $("#telegram_botToken").val();
        settings.telegram.chatId = $("#telegram_chatId").val();
        settings.arbitrage.status = $("#status option:selected").val();
        settings.arbitrage.showPrices = $("#showPrices").is(":checked");
        settings.arbitrage.showDiff = $("#showDiff").is(":checked");
        
        settings.arbitrage.leftExchange = $("#leftExchange").val();
        settings.arbitrage.leftApiKey = getApiKey($('#leftExchange').find(":selected").text());
        settings.arbitrage.leftApiSecret = getApiSecret($('#leftExchange').find(":selected").text());
        settings.arbitrage.leftApiPassphrase = getApiPassphrase($('#leftExchange').find(":selected").text());
        settings.arbitrage.leftSymbol = $("#leftSymbol").val();

        settings.arbitrage.rightExchange = $("#rightExchange").val();
        settings.arbitrage.rightApiKey = getApiKey($('#rightExchange').find(":selected").text());
        settings.arbitrage.rightApiSecret = getApiSecret($('#rightExchange').find(":selected").text());
        settings.arbitrage.rightApiPassphrase = getApiPassphrase($('#rightExchange').find(":selected").text());
        settings.arbitrage.rightSymbol = $("#rightSymbol").val();       
        
        $.ajax({
            type : "POST",
            url  : './updateSettings.php',
            data : settings,
            dataType:'json',
            beforeSend :function() {
                $('#btn_save').attr('disabled','disabled');
            },
            success	:function(res) {
                console.log("res",res);
                $('#btn_save').removeAttr('disabled');
            },
            error:function(request, status, error){
                $('#btn_save').removeAttr('disabled');
                console.log("error",request.responseText);
            }
        });
        window.location.reload(true);
    });

});
</script>
  </body>
</html>
