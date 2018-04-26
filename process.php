<?php
include('Parsedown.php');
$configs = include('config.php');
try {
    if(isset($_POST['submit'])){
        // create curl resource
        $ch = curl_init();
        $userquery = $_POST['message'];
        $query = curl_escape($ch,$_POST['message']);
        $sessionid = curl_escape($ch,$_POST['sessionid']);
        curl_setopt($ch, CURLOPT_URL,
            "https://api.api.ai/v1/query?v=20150910&query=".$query."&lang=en&sessionId=".$sessionid);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json',
            'Authorization: Bearer '.trim($configs['cb4e2bebe12b47a393a13580be7ac2f1'])));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $output = curl_exec($ch);
        $dec = json_decode($output);

        $messages = $dec->result->fulfillment->messages;
        $action = $dec->result->action;
        $intentid = $dec->result->metadata->intentId;
        $intentname = $dec->result->metadata->intentName;
        $isEndOfConversation = $dec->result->metadata->endConversation;
        $speech = '';
        for($idx = 0; $idx < count($messages); $idx++){
            $obj = $messages[$idx];
            if($obj->type=='0'){
                $speech = $obj->speech;
            }
        }

        $Parsedown = new Parsedown();
        $transformed= $Parsedown->text($speech);
        $response -> speech = $transformed;
        $response -> messages = $messages;
        $response -> isEndOfConversation = $isEndOfConversation;
        echo json_encode($response);
        // close curl resource to free up system resources
        curl_close($ch);
    }
}catch (Exception $e) {
    $speech = $e->getMessage();
    $fulfillment = new stdClass();
    $fulfillment->speech = $speech;
    $result = new stdClass();
    $result->fulfillment = $fulfillment;
    $response = new stdClass();
    $response->result = $result;
    echo json_encode($response);
}

?>