<?php
$servername = "127.0.0.1";
$username = "root";
$password = "1234";
$db = "drc";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$db;charset=utf8", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
    exit();
}

$sql = "SELECT * FROM pages WHERE (tx_flygtninge_address <>'' OR tx_flygtninge_city<>'')  AND tx_flygtninge_entity_type = 'gruppe' AND deleted=0 LIMIT 100000";
$res = $conn->prepare($sql);
try {
    $res->execute();
} catch (\PDOException $e) {
    echo $e->getMessage();
    exit();
}
$path = "";
$output = "drc.json";
$log = "missed.log";
$features = array();

@unlink($path . $log);
$fh = fopen($path . $log, 'w');
while ($row = $res->fetch(PDO::FETCH_ASSOC)) {

    $address = urlencode("{$row['tx_flygtninge_address']} {$row['tx_flygtninge_city']}");
    $geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" . $address;
    $placeUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json?key=AIzaSyC5I9CzwBtmVz-l1ke8wfnVrbhz0eQhQKw&query=" . $address;

    // First address
    $addressArr = json_decode(file_get_contents($geocodeUrl), true);

    if ($addressArr["status"] != "OK") {
        // Second place
        $addressArr = json_decode(file_get_contents($placeUrl), true);
        if ($addressArr["status"] != "OK") {
            print_r($addressArr);
            fwrite($fh, urldecode($address) . "\n");
            echo "-";
            continue;
        }
    }
    echo "+";

    $lat = $addressArr["results"][0]["geometry"]["location"]["lat"];
    $lng = $addressArr["results"][0]["geometry"]["location"]["lng"];

    $properties["formatted_address"] = $addressArr["results"][0]["formatted_address"];
    $properties["title"] = $row["title"];
    $properties["tx_flygtninge_address"] = urldecode($address);
    $properties["tx_flygtninge_zip"] = $row["tx_flygtninge_zip"];
    $properties["tx_flygtninge_city"] = $row["tx_flygtninge_city"];
    $properties["tx_flygtninge_phone1"] = $row["tx_flygtninge_phone1"];
    $properties["tx_flygtninge_phone2"] = $row["tx_flygtninge_phone2"];
    $properties["tx_flygtninge_email1"] = $row["tx_flygtninge_email1"];
    $properties["tx_flygtninge_email2"] = $row["tx_flygtninge_email2"];
    $properties["tx_flygtninge_description"] = $row["tx_flygtninge_description"];
    $properties["tx_flygtninge_www"] = $row["tx_flygtninge_www"];
    $properties["tx_flygtninge_activity_type"] = $row["tx_flygtninge_activity_type"];
    $properties["tx_flygtninge_activity_hours"] = $row["tx_flygtninge_activity_hours"];
    $properties["tx_flygtninge_entity_type"] = $row["tx_flygtninge_entity_type"];

    $geometry["type"] = "Point";
    $geometry["coordinates"] = array($lng, $lat);

    $feature["type"] = "Feature";
    $feature["properties"] = $properties;
    $feature["geometry"] = $geometry;

    $features[] = $feature;
}
fclose($fh);

$geoArr = array("type" => "FeatureCollection", "features" => $features);
//echo json_encode($geoArr);
@unlink($path . $output);
$fh = fopen($path . $output, 'w');
fwrite($fh, json_encode($geoArr));
fclose($fh);
echo "\n";