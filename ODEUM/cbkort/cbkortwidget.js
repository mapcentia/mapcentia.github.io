(function () {
    var options = {
        'apikey': '52EC9D0D-998A-4815-A0AC-978339CF9743',
        'select': handleSelect,
        'recieved': handleReceived,
        'error': function (message) {
            alert(message)
        },
        'area': 'muncode0706'
    };
    $("#search").spatialfind(options);
}());
var extent;
var handleSelect = function (data) {
    mapComp.map.setCenter(new OpenLayers.LonLat(data.x, data.y), 8)
};
var handleReceived = function (result) {
};
var switchLayer = function (name) {
    if ($('#checkbox_' + name).is(':checked')) {
        mapComp.map.getLayersByName(name)[0].setVisibility(true);
    } else {
        mapComp.map.getLayersByName(name)[0].setVisibility(false);
    }
};
var switchBaseLayer = function (name) {
    if (name == base1) {
        mapComp.map.getLayersByName(base2)[0].setVisibility(false);
        var base = mapComp.map.getLayersByName(base1)[0];
        base.setVisibility(true);
        mapComp.map.setBaseLayer(base);
    } else {
        mapComp.map.getLayersByName(base1)[0].setVisibility(false);
        var base = mapComp.map.getLayersByName(base2)[0];
        base.setVisibility(true);
        mapComp.map.setBaseLayer(base);
    }
};
var zoomOut = function () {
    mapComp.zoomToExtent();
};
var modalMap = function () {
    extent = mapComp.map.getExtent()
    $("#mapDialog").html($("#mapLayers"));
    $("#mapDialog").dialog({
        height: $(window).height() - 50,
        width: $(window).width() - 50,
        modal: true,
        closeOnEscape: true,
        beforeClose: function () {
            $("#mapContainer").html($("#mapLayers"));
            extent = mapComp.map.getExtent();
            mapComp.map.updateSize();

        },
        close: function () {
            mapComp.map.zoomToExtent(extent, true);
        }
    });
    mapComp.map.updateSize();
    mapComp.map.zoomToExtent(extent, true);
};
$("#knap").button();
$("#knapstortkort").click(function () {
    modalMap();
});
$("#zoomout").click(function () {
    zoomOut();
});
$("#lag-knap").click(function (e) {
    ($("#legend").css('display') !== 'none') ? $("#legend").fadeOut(100) : $("#legend").fadeIn(100);
})

//var url = window.mapUrl;
var url = "http://webgis.esbkomm.dk/cbkort?selectorgroups=themecontainer%20grundkort%20kp_bindinger%20kommuneplan_gaeldende&mapext=427703.6%206113233.2%20532407.6%206167505.2&layers=theme-cowi-arialphoto-none%20theme-v3_kommune_esbjerg%20theme-kms-dtkskaerm-sh%20theme-v1_kp14_bi_kystnaerebyzoner%20theme-v1_kp14_bi_kystnaerhedszone%20theme-v1_kp14_bi_havdige&mapheight=1065&mapwidth=2050&profile=tmkommuneplan_klima";
var mapComp;
var base1 = "dtk_skaermkort_daempet";
var base2 = "dtk_skaermkort";
var base3 = "theme-gst-dtkskaerm";
var base4 = "theme-cowi-arialphoto-none";
var base5 = "theme-kms-dtkskaerm-sh";

url = decodeURIComponent(url);
url = url.replace(base1 + " ", "");
url = url.replace(base2 + " ", "");
url = url.replace(base3 + " ", "");
url = url.replace(base4 + " ", "");
url = url.replace(base5 + " ", "");
url = url.replace(base1 + "", "");
url = url.replace(base2 + "", "");
url = url.replace(base3 + "", "");
url = url.replace(base4 + "", "");
url = url.replace(base5 + "", "");
var mapvars = {};
var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    mapvars[key] = value;
});
var layerArr = [];
var layers = mapvars['layers'].split(" ");
for (var u = 0; u < layers.length; u++) {
    if (layers[u].substring(0, 1) === "1") {
        layerArr.push({id: layers[u].substring(1), layername: layers[u].substring(1), format: "image/png", basemap: false, singleTile: true, visible: false, host: "http://webkort.esbjergkommune.dk/wms?SERVICE=WMS&SERVICENAME=borger_kommuneplan"});
    }
    else {
        layerArr.push({id: layers[u], layername: layers[u], format: "image/png", basemap: false, singleTile: true, visible: true, host: "http://webkort.esbjergkommune.dk/wms?SERVICE=WMS&SERVICENAME=borger_kommuneplan"});
    }
}
layerArr.reverse();
//layerArr.push({id: base1, layername: base1, format: "image/jpeg", basemap: true, visible: true, host: "http://a.kortforsyningen.kms.dk/topo_skaermkort?&matrixset=View1&ticket=71d15474ef6739443a59a5a9db077640&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=dtk_skaermkort&STYLE=default&TILEMATRIXSET=View1&TILEMATRIX=L04&TILEROW=12&TILECOL=10&FORMAT=image%2Fjpeg"});
// layerArr.push({id: base2, layername: base2, format: "image/jpeg", basemap: true, visible: false, host: "http://mapcache.esbjergkommune.dk/geowebcache/service/wms?SERVICENAME=esbjergkommune"});
layerArr.reverse();
$(window).load(function () {
    var options = {
        layers: layerArr,
        servicename: "borger_kommuneplan",
        extent: {x1: 408990, y1: 6103556, x2: 542110, y2: 6175543},
        resolutions: [0.1, 0.2, 0.4, 0.8, 1.6, 3.2, 6.4, 12.8, 25.6, 51.2, 102.4, 204.8]
    };
    mapComp = new SpatialMap.Map("map", options);
    mapComp.setMapControls({mousePosition: false});
    mapComp.setClickEvent(function () {
    });
    var wmtsSkaermkort = new OpenLayers.Layer.WMTS({
        name: "dtk_skaermkort",
        url: ["http://a.kortforsyningen.kms.dk/topo_skaermkort", "http://b.kortforsyningen.kms.dk/topo_skaermkort", "http://c.kortforsyningen.kms.dk/topo_skaermkort"],
        style: "default",
        layer: "dtk_skaermkort",
        matrixSet: "View1",
        format: "image/jpeg",
        params: {
            ticket: "71d15474ef6739443a59a5a9db077640"
        },
        matrixIds: [
            {identifier: "L00", scaleDenominator: 1638.4 / 0.00028},
            {identifier: "L01", scaleDenominator: 819.2 / 0.00028},
            {identifier: "L02", scaleDenominator: 409.6 / 0.00028},
            {identifier: "L03", scaleDenominator: 204.8 / 0.00028},
            {identifier: "L04", scaleDenominator: 102.4 / 0.00028},
            {identifier: "L05", scaleDenominator: 51.2 / 0.00028},
            {identifier: "L06", scaleDenominator: 25.6 / 0.00028},
            {identifier: "L07", scaleDenominator: 12.8 / 0.00028},
            {identifier: "L08", scaleDenominator: 6.4 / 0.00028},
            {identifier: "L09", scaleDenominator: 3.2 / 0.00028},
            {identifier: "L10", scaleDenominator: 1.6 / 0.00028},
            {identifier: "L11", scaleDenominator: 0.8 / 0.00028}
        ],
        isBaseLayer: true,
        displayInLayerSwitcher: true,
        transitionEffect: 'resize',
        visibility: false,
        zIndex: 1
    });

    var wmtsSkaermkortDaempet = new OpenLayers.Layer.WMTS({
        name: "dtk_skaermkort_daempet",
        url: ["http://a.kortforsyningen.kms.dk/topo_skaermkort_daempet", "http://b.kortforsyningen.kms.dk/topo_skaermkort_daempet", "http://c.kortforsyningen.kms.dk/topo_skaermkort_daempet"],
        style: "default",
        layer: "dtk_skaermkort_daempet",
        matrixSet: "View1",
        format: "image/jpeg",
        params: {
            ticket: "71d15474ef6739443a59a5a9db077640"
        },
        matrixIds: [
            {identifier: "L00", scaleDenominator: 1638.4 / 0.00028},
            {identifier: "L01", scaleDenominator: 819.2 / 0.00028},
            {identifier: "L02", scaleDenominator: 409.6 / 0.00028},
            {identifier: "L03", scaleDenominator: 204.8 / 0.00028},
            {identifier: "L04", scaleDenominator: 102.4 / 0.00028},
            {identifier: "L05", scaleDenominator: 51.2 / 0.00028},
            {identifier: "L06", scaleDenominator: 25.6 / 0.00028},
            {identifier: "L07", scaleDenominator: 12.8 / 0.00028},
            {identifier: "L08", scaleDenominator: 6.4 / 0.00028},
            {identifier: "L09", scaleDenominator: 3.2 / 0.00028},
            {identifier: "L10", scaleDenominator: 1.6 / 0.00028},
            {identifier: "L11", scaleDenominator: 0.8 / 0.00028}
        ],
        isBaseLayer: true,
        displayInLayerSwitcher: true,
        transitionEffect: 'resize',
        zIndex: 1
    });
    mapComp.map.addLayer(wmtsSkaermkort);
    wmtsSkaermkort.setZIndex(1);
    mapComp.map.addLayer(wmtsSkaermkortDaempet);
    wmtsSkaermkortDaempet.setZIndex(1);

    $('#legend').append($('#template').jqote(options))
    for (var i = 0; i < options.layers.length; i++) {
        if (!layerArr[i].basemap) {
            $.ajax({
                    dataType: 'jsonp',
                    async: false,
                    data: 'layer=' + options.layers[i].layername + '&url=http%3A%2F%2Fwebkort.esbjergkommune.dk%2Fcbkort%3Flayers%3D' + options.layers[i].layername + '%26page%3Dlegend-data%26profile%3D' + options.layers[i].servicename + '&lifetime=0',
                    jsonp: 'jsonp_callback',
                    url: "http://beta.mygeocloud.cowi.webhouse.dk/apps/custom/randers/xml_to_json.php",
                    success: function (response) {
                        var layer = response.layer;
                        var legendHtml = "<table class='legend' >";
                        var arr = response.pcomposite.pcomposite.rowlist.row;
                        if (Object.prototype.toString.call(arr) !== '[object Array]') {
                            arr = [arr];
                        }
                        for (var u = 0; u < arr.length; u++) {
                            legendHtml += '<tr><td><img src="http://webkort.esbjergkommune.dk' + arr[u].col[3]._content + '"/></td><td>' + arr[u].col[0]._content + '</td></tr>';
                            if (u == arr.length - 1) {
                                legendHtml += "</table>";
                                $('#legend_' + layer).append(legendHtml);
                                legendHtml = "";
                            }
                        }
                    }
                }
            );
        }
    }
});