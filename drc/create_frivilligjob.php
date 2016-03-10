<?php
$url = "http://frivilligjob.jobbank.dk/xml/jobliste.asp?guid=82622EE6-5CA9-42F2-8A4A-B3BAE9A24863&virk=17917";

$path = "";
$output = "frivilligjob.json";
$features = array();

$xml = simplexml_load_string(file_get_contents($url));
$xml->registerXPathNamespace('m', 'http://www.jobbank.dk/xml/soap');
$properties = array();
foreach ($xml->xpath('//m:Posting') as $i => $item) {
    $properties = array(
        "Title" => (string)$item->xpath('//m:Title')[$i],
        "Organisation" => (string)$item->xpath('//m:Organisation')[$i],
        "WorkAddress" => (string)$item->xpath('//m:WorkAddress')[$i],
        "WorkZipcode" => (string)$item->xpath('//m:WorkZipcode')[$i],
        "ActivateDate" => (string)$item->xpath('//m:ActivateDate')[$i],
        "Id" => (string)$item->xpath('//m:Id')[$i],
    );
    $coords = explode(",", (string)$item->xpath('//m:GeoLocation')[$i]);
    $geometry["type"] = "Point";
    $geometry["coordinates"] = array((float)$coords[1], (float)$coords[0]);

    $feature["type"] = "Feature";
    $feature["properties"] = $properties;
    $feature["geometry"] = $geometry;
    $features[] = $feature;
}
$geoArr = array("type" => "FeatureCollection", "features" => $features);
@unlink($path . $output);
$fh = fopen($path . $output, 'w');
fwrite($fh, json_encode($geoArr));
fclose($fh);
echo "\n";