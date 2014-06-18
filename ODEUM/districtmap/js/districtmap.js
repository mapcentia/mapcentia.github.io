var mapcentia_districtmap;
mapcentia_districtmap = (function () {
    "use strict";
    var mygeocloud_host = "http://eu1.mapcentia.com";
    document.write("<script src='" + mygeocloud_host + "/api/v1/js/api.js'><\/script>");
    document.write("<script src='" + mygeocloud_host + "/js/hogan/hogan-2.0.0.js'><\/script>");
    document.write("<script src='js/templates.js'><\/script>");
    var selectControl = {
            onSelect: function (feature) {
                $("#start").show();
                var irowid = feature.attributes.irowid;
            },
            onUnselect: function () {
                $("#start").hide();
            }
        },
        init = function (config) {
            $('<link/>').attr({ rel: 'stylesheet', type: 'text/css', href: 'http://cowi.mapcentia.com/js/ext/resources/css/ext-all.css' }).appendTo('head');
            var defaults = {
                    db: null,
                    district: null,
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
                                    fillColor: "#deffde",
                                    fillOpacity: 0.3,
                                    strokeColor: "#deffde"
                                }
                            }),
                            new OpenLayers.Rule({
                                filter: new OpenLayers.Filter.Comparison({
                                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                                    property: "anvgen",
                                    value: '91'
                                }),
                                symbolizer: {
                                    fillColor: "#dedfde",
                                    fillOpacity: 0.3,
                                    strokeColor: "#dedfde"
                                }
                            })
                        ]
                    },
                    columns: [
                        {
                            "header": "Plannr",
                            "dataIndex": "plannr",
                            "type": "varchar",
                            "typeObj": null,
                            "sortable": false
                        },
                        {
                            "header": "Plannavn",
                            "dataIndex": "plannavn",
                            "type": "varchar",
                            "typeObj": null
                        },
                        {
                            "header": "Anvendelse",
                            "dataIndex": "anv",
                            "type": "varchar",
                            "typeObj": null
                        }
                    ]
                },
                map, grid, store, prop;
            if (config) {
                for (prop in config) {
                    defaults[prop] = config[prop];
                }
            }
            $("div:last").html(templates.body.render());
            map = new mygeocloud_ol.map("map", defaults.db)
            store = new mygeocloud_ol.geoJsonStore(defaults.db, {styleMap: new OpenLayers.StyleMap(
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
            ), lifetime: 0});
            map.addOSM();
            map.addGeoJsonStore(store);
            store.sql = "SELECT anvgen,plannr,plannavn,html,textvalue as anv,ST_simplify(the_geom,4) FROM " + defaults.table + ",ANVGEN_PLANDK2 WHERE distrikt='" + encodeURIComponent(defaults.district) + "' AND langid=1 AND ANVGEN_PLANDK2.fieldkey=" + defaults.table + ".anvgen order by substring(plannr from '[A-Z]|[a-z]+')::text,substring(split_part(plannr, '.', 2) from '[0-9]+')::int";
            store.load();
            store.onLoad = function () {
                map.zoomToExtentOfgeoJsonStore(store);
                grid = new mygeocloud_ol.grid("grid", store, {
                    columns: defaults.columns,
                    selectControl: selectControl,
                    height: 245
                });
                $("#zoom").on("click",
                    function () {
                        grid.grid.getSelectionModel().each(function (rec) {
                                var feature = rec.get('feature');
                                map.map.zoomToExtent(feature.geometry.getBounds());
                            }
                        );
                    }
                );
                $("#look").on("click",
                    function () {
                        var feature;
                        grid.grid.getSelectionModel().each(function (rec) {
                            feature = rec.get('feature');
                        });
                        var record = grid.grid.getSelectionModel().getSelected();
                        window.location = record.get('html');
                    });
            };
        };
    return {
        init: init
    };
}());