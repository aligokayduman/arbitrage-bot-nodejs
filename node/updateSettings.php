<?php
    try {
        if(isset($_POST)) file_put_contents('settings.json', json_encode($_POST, JSON_PRETTY_PRINT));
        echo json_encode(array("success" => true));
    } catch (Exception $e) {
        echo json_encode(array("success" => false,"error" => "Some random error happened:".$e));
    }
    