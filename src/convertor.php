<?php
$h = fopen("maps-60.txt", "r");
if(!$h) {
    die('Error open file');
}
$map_mode=false;
$map_n=0;
$map=[];
$maps=[];
while (($row = fgets($h, 4096)) !== false) {
    if($map_mode) {
        if($row=="\n") {
            $map_mode=false;
            $json=json_encode($map);
            $maps[]=$map;
        } else {
            $map[]=substr($row,0,strlen($row)-1);
        }
    } else {
        if($row=="\n") {
            $map_mode=true;
            $map_n++;
            $map=[];
        }    
    }
}
if (!feof($h)) {
    echo "Ошибка: fgets() неожиданно потерпел неудачу\n";
}
fclose($h);
$json=json_encode($maps);
echo($json);