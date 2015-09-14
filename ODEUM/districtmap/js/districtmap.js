var mapcentia_districtmap;
mapcentia_districtmap = (function () {
    "use strict";
    var mygeocloud_host = "http://cowi.mapcentia.com";
    // We've to set global var for f*****K IE9
    window.mygeocloud_host = mygeocloud_host;
    document.write("<script src='" + mygeocloud_host + "/api/v1/js/api.js'><\/script>");
    document.write("<script src='" + mygeocloud_host + "/js/hogan/hogan-2.0.0.js'><\/script>");
    document.write("<script src='http://mapcentia.github.io/ODEUM/templates/templates.js'><\/script>");
    //document.write("<script src='js/templates.js'><\/script>");
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
            $('<link/>').attr({ rel: 'stylesheet', type: 'text/css', href: 'http://mapcentia.github.io/ODEUM/districtmap/css/bootstrap-buttons.css' }).appendTo('head');
            var defaults = {
                    db: null,
                    where: null,
                    width: "500px",
                    height: "500px",
                    table: "kommuneplan.kpplandk2_view",
                    gridHeight: 245,
                    baseLayer: "dtkSkaermkortDaempet",
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
                    },
                    columns: [
                        {
                            "header": "Plannr",
                            "dataIndex": "plannr",
                            "type": "varchar",
                            "typeObj": null,
                            "sortable": true,
                            "width": 50
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
                        },
                        {
                            "header": "Status",
                            "dataIndex": "status",
                            "type": "varchar",
                            "typeObj": null,
                            "width": 50
                        }
                    ]
                },
                map, grid, store, prop;
            if (config) {
                for (prop in config) {
                    defaults[prop] = config[prop];
                }
            }
            $("div:last").html(templates.districtmap1.render(defaults));
            map = new mygeocloud_ol.map("map", defaults.db);
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
            map.addBaseLayer(defaults.baseLayer);
            map.addGeoJsonStore(store);
            store.sql = "SELECT anvgen,plannr,plannavn,html,textvalue as anv,(case when status = 'vedtaget' then 'Vedtaget' else 'Forslag' END) as status,the_geom FROM " + defaults.table + ",ANVGEN_PLANDK2 WHERE " + encodeURIComponent(defaults.where) + " AND (status = 'forslag' OR status = 'vedtaget') AND langid=1 AND ANVGEN_PLANDK2.fieldkey=" + defaults.table + ".anvgen order by plannr";
            store.load();
            store.onLoad = function () {
                map.zoomToExtentOfgeoJsonStore(store);
                grid = new mygeocloud_ol.grid("grid", store, {
                    columns: defaults.columns,
                    selectControl: selectControl,
                    height: defaults.gridHeight
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