<?php


function send_response($msg, $isError = false)
{
    header("Content-Type: application/json");
    echo json_encode(array(
        'status' => $isError ? 'failed' : 'ok',
        'response' => $msg
    ));
}


class Client
{
    public static function getName($decoded)
    {
        $name = isset($decoded['name']) ? $decoded['name'] : '';
        $res = preg_replace("/[^A-Za-z0-9?!]/", '', $name);
        return $res;
    }


    public static function getTel($decoded)
    {
        $tel = isset($decoded['tel']) ? $decoded['tel'] : '';
        $res = preg_replace('/\D/', "", $tel);
        return $res;
    }

    public static function getCaptcha($decoded)
    {
        return isset($decoded['captcha']) ? $decoded['captcha'] : '';
    }
}

class RequestMethod
{
    const SITE_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

    public static function post($secret, $response)
    {
        /**
         * PHP 5.6.0 changed the way you specify the peer name for SSL context options.
         * Using "CN_name" will still work, but it will raise deprecated errors.
         */
        $peer_key = version_compare(PHP_VERSION, '5.6.0', '<') ? 'CN_name' : 'peer_name';
        $params = array('secret' => $secret, 'response' => $response);

        $options = array(
            'http' => array(
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($params, '', '&'),
                // Force the peer to validate (not needed in 5.6.0+, but still works
                'verify_peer' => true,
                // Force the peer validation to use www.google.com
                $peer_key => 'www.google.com',
            ),
        );
        $context = stream_context_create($options);
        return file_get_contents(self::SITE_VERIFY_URL, false, $context);
    }
}


class ClientValidator
{
    public static function tel($input)
    {
        return isset($input) ? strlen($input) === 11 : false;
    }

    public static function name($input)
    {
        return isset($input) ? strlen($input) >= 2 : false;
    }

    private static $secret = '6Lc-9gkTAAAAAAyzlwaXfrKV2bgE97t8G19L3pJG';

    public static function captcha($input)
    {
        $res = false;
        if (!empty($input)) {
            $responseData = json_decode(RequestMethod::post(self::$secret, $input), true);
            $res = isset($responseData['success']) && $responseData['success'] == true;
        }
        return $res;
    }

    /**
     * @param $decoded
     * @return array|bool
     */
    public static function hasErrors($decoded)
    {
        $res = array();
        $errors = array();

        if (!self::tel($decoded['tel'])) {
            $errors[] = 'Телефон';
        }

        if (!self::name($decoded['name'])) {
            $errors[] = 'Имя';
        }

        if (!self::captcha($decoded['captcha'])) {
            $errors[] = 'Робот?';
        }

        return count($errors) ? $errors : false;
    }

}


function addCallback($name, $tel)
{
    $urlTempl = 'http://78.140.6.16:4077/execsvcscriptplain?name=web&startparam1=callback&startparam2={phone}&async=0&timeout=30';
    $url = str_replace('{phone}', $tel, $urlTempl);
   // $url = str_replace('name=web', 'name=' . $name, $url);

    $username = 'web';
    $password = 'WCnX39vNY9hGTj5C1ADApk2r';

    $options = array(
        'http' => array(
            'header' => "Authorization: Basic " . base64_encode("$username:$password"),
            'method' => 'GET'
        ),
    );
    $context = stream_context_create($options);

    $resp = file_get_contents($url, false, $context);

    //file_put_contents('input_resp', $resp);

    return $resp;
}

function checkCallbackResponse($resp)
{
    // нет смысла париться и разбирать xml
    return strpos($resp, '<code>ok</code>') !== false;
}


// main

$ajax;
$req;

try {

    if (isset($_POST['ajax'])) {
        $ajax = $_POST['ajax'];
        $decoded = json_decode($ajax, true);
        $errors = array();

        $errors = ClientValidator::hasErrors($decoded);
        if ($errors) {
            throw new Exception(implode(', ', $errors));
        }

        $name = Client::getName($decoded);
        $tel = Client::getTel($decoded);

     //   file_put_contents('input.txt', file_get_contents("php://input"));

        $callAnswer = addCallback($name, $tel);


        if (!checkCallbackResponse($callAnswer)) {
            $hasError = true;
            send_response('Заявка не принята', $hasError);
        } else {
            $hasError = false;
            send_response('Заявка принята', $hasError);
        }

    } else {
        throw new HttpInvalidParamException('ajax param was not received');
    }

} catch (Exception $e) {
    $hasError = true;
    send_response($e->getMessage(), $hasError);
}