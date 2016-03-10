var mapcentia_rammemap;
var test
mapcentia_rammemap = (function () {
    "use strict";
    var mygeocloud_host = "http://cowi.mapcentia.com";
    if (typeof jQuery === "undefined") {
        document.write("<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js'><\/script>");
    }
    document.write("<script src='" + mygeocloud_host + "/js/OpenLayers-2.12/OpenLayers.js'><\/script>");
    document.write("<script src='http://192.168.33.11/api/v3/js/geocloud.js'><\/script>");
    document.write("<script src='" + mygeocloud_host + "/js/hogan/hogan-2.0.0.js'><\/script>");
    document.write("<script src='http://mapcentia.github.io/ODEUM/templates/templates.js'><\/script>");
    //document.write("<script src='../templates/templates.js'><\/script>");
    var i, init = function (config) {
        $('<link/>').attr({ rel: 'stylesheet', type: 'text/css', href: 'http://mapcentia.github.io/ODEUM/districtmap/css/bootstrap-buttons.css' }).appendTo('head');
        var defaults = {
                planid: null,
                db: null,
                where: null,
                width: "500px",
                height: "500px",
                layers: null,
                table: "kommuneplan.kpplandk2_view",
                rules: {
                    rules: [
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                property: "anvgen",
                                value: '11'
                            }),
                            symbolizer: {
                                fillColor: "#c66100",
                                fillOpacity: 0.3,
                                strokeColor: "#c66100"
                            }
                        }),
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                property: "anvgen",
                                value: '21'
                            }),
                            symbolizer: {
                                fillColor: "#ff615a",
                                fillOpacity: 0.3,
                                strokeColor: "#ff615a"
                            }
                        }),
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                property: "anvgen",
                                value: '31'
                            }),
                            symbolizer: {
                                fillColor: "#6bffff",
                                fillOpacity: 0.3,
                                strokeColor: "#6bffff"
                            }
                        }),
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                property: "anvgen",
                                value: '41'
                            }),
                            symbolizer: {
                                fillColor: "#ff69ff",
                                fillOpacity: 0.3,
                                strokeColor: "#ff69ff"
                            }
                        }),
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                property: "anvgen",
                                value: '51'
                            }),
                            symbolizer: {
                                fillColor: "#39ff39",
                                fillOpacity: 0.3,
                                strokeColor: "#39ff39"
                            }
                        }),
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                property: "anvgen",
                                value: '61'
                            }),
                            symbolizer: {
                                fillColor: "#ffefad",
                                fillOpacity: 0.3,
                                strokeColor: "#ffefad"
                            }
                        }),
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                property: "anvgen",
                                value: '71'
                            }),
                            symbolizer: {
                                fillColor: "#efef00",
                                fillOpacity: 0.3,
                                strokeColor: "#efef00"
                            }
                        }),
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                property: "anvgen",
                                value: '81'
                            }),
                            symbolizer: {
                                fillColor: "#9c9e9c",
                                fillOpacity: 0.3,
                                strokeColor: "#9c9e9c"
                            }
                        }),
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                property: "anvgen",
                                value: '91'
                            }),
                            symbolizer: {
                                fillColor: "#33CCCC",
                                fillOpacity: 0.3,
                                strokeColor: "#008080"
                            }
                        }),
                        new OpenLayers.Rule({
                            filter: new OpenLayers.Filter.Comparison({
                                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                property: "anvgen",
                                value: '96'
                            }),
                            symbolizer: {
                                fillColor: "#C0C0C0",
                                fillOpacity: 0.3,
                                strokeColor: "#969696"
                            }
                        })
                    ]
                }
            },

            map, store, prop;
        if (config) {
            for (prop in config) {
                defaults[prop] = config[prop];
            }
        }
        $("div:last").html(templates.rammemap1.render(defaults));
        map = new geocloud.map({
            el: "map"
        });
        test = map
        store = new geocloud.geoJsonStore(
            {
                db: defaults.db,
                host: mygeocloud_host,
                styleMap: new OpenLayers.StyleMap(
                    {
                        "default": new OpenLayers.Style(
                            {
                                fillColor: "#ffffff",
                                fillOpacity: 0.0,
                                strokeColor: "#00aa00",
                                strokeWidth: 2,
                                graphicZIndex: 3
                            },
                            defaults.rules
                        ),
                        "select": new OpenLayers.Style(
                            {
                                fillColor: "#0000ff",
                                fillOpacity: 0.5,
                                strokeColor: "#000000",
                                strokeWidth: 0,
                                graphicZIndex: 1000
                            }
                        )
                    }
                ),
                lifetime: 0
            }
        );
        map.addBaseLayer("OSM");
        map.setBaseLayer("OSM");
        map.addGeoJsonStore(store);
        store.sql = "SELECT anvgen,the_geom FROM " + defaults.table + " WHERE planid = '" + encodeURIComponent(defaults.planid) + "'";
        store.load();
        store.onLoad = function () {
            map.zoomToExtentOfgeoJsonStore(store);
            console.log(map.map)
            if (defaults.layers) {
                for (i = 0; i < defaults.layers.length; i = i + 1) {
                    map.addTileLayers({
                        layers: [defaults.layers[i]],
                        host: mygeocloud_host,
                        db: defaults.db,
                        wrapDateLine: false
                    });
                }
                (function () {
                    var param = 'l=' + map.getVisibleLayers();
                    $.ajax({
                        url: mygeocloud_host + '/api/v1/legend/html/' + defaults.db + '/?' + param,
                        dataType: 'jsonp',
                        jsonp: 'jsonp_callback',
                        success: function (response) {
                            $('#legend').html(response.html);
                        }
                    });
                }());
            }
        };

    };
    return {
        init: init
    };
}());