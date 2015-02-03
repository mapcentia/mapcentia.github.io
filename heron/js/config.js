/*global $:false */
/*global Ext:false */
/*global Heron:false */
/*global MapCentia:false */
/*global OpenLayers:false */
/*global ol:false */
/*global GeoExt:false */
/*global document:false */
/*global window:false */
Ext.namespace("MapCentia");
Ext.namespace("Heron.options");
Ext.namespace("Heron.options.map");
Ext.namespace("Heron.options.wfs");
Ext.namespace("Heron.options.center");
Ext.namespace("Heron.options.zoom");
Ext.namespace("Heron.options.layertree");
Ext.chart.Chart.CHART_URL = 'http://eu1.mapcentia.com/js/ext/resources/charts.swf';
var metaData, metaDataKeys = [], metaDataKeysTitle = [], click, poilayer, qstore = [], queryWin;
MapCentia.setup = function () {
    "use strict";
    Heron.globals.metaReady = false;
    Heron.globals.serviceUrl = '/cgi/heron.cgi';
    var uri = window.location.pathname.split("/"),
        host = "http://us1.mapcentia.com",
        db = "envimatix",
        schema = "test2",
        url = host + '/wms/' + db + '/tilecache/' + schema;

    $.ajax({
        url: host + '/api/v1/setting/' + db,
        dataType: 'jsonp',
        jsonp: 'jsonp_callback',
        success: function (response) {
            if (typeof response.data.extents === "object") {
                if (typeof response.data.center[schema] === "object") {
                    Heron.options.zoom = response.data.zoom[schema];
                    Heron.options.center = response.data.center[schema];
                }
            }
            Heron.options.map.settings = {
                projection: 'EPSG:900913',
                displayProjection: new OpenLayers.Projection("EPSG:4326"),
                units: 'm',
                maxExtent: '-20037508.34, -20037508.34, 20037508.34, 20037508.34',
                center: Heron.options.center,
                maxResolution: 'auto',
                xy_precision: 5,
                zoom: Heron.options.zoom + 1, // Why?
                theme: null,
                permalinks: {
                    /** The prefix to be used for parameters, e.g. map_x, default is 'map' */
                    paramPrefix: 'map',
                    /** Encodes values of permalink parameters ? default false*/
                    encodeType: false,
                    /** Use Layer names i.s.o. OpenLayers-generated Layer Id's in Permalinks */
                    prettyLayerNames: true
                }
            };
            Heron.options.map.layers = [
                new OpenLayers.Layer.Google(
                    "Google Streets", // the default
                    {type: google.maps.MapTypeId.ROADMAP, visibility: false},
                    {singleTile: false, buffer: 0, isBaseLayer: true}
                ),
                new OpenLayers.Layer.Google(
                    "Google Satellite",
                    {type: google.maps.MapTypeId.SATELLITE, visibility: true},
                    {singleTile: false, buffer: 0, isBaseLayer: true}
                ),
                new OpenLayers.Layer.Google(
                    "Google Terrain",
                    {type: google.maps.MapTypeId.TERRAIN, visibility: false},
                    {singleTile: false, buffer: 0, isBaseLayer: true}
                ),
                new OpenLayers.Layer.Google(
                    "Google Hybrid",
                    {type: google.maps.MapTypeId.HYBRID, visibility: false},
                    {singleTile: false, buffer: 0, isBaseLayer: true}
                ),
                [
                    "OpenLayers.Layer.Bing",
                    {
                        key: "Ar00ZDTFpjaza5W0AvQrJq8lEuSgevERqr6MjpIXJHoV2vKnusZh1ExhLX6DTKLK",
                        type: "Road",
                        name: "Bing Road",
                        transitionEffect: 'resize'
                    },
                    {
                        isBaseLayer: true
                    }
                ],
                [
                    "OpenLayers.Layer.Bing",
                    {
                        key: "Ar00ZDTFpjaza5W0AvQrJq8lEuSgevERqr6MjpIXJHoV2vKnusZh1ExhLX6DTKLK",
                        type: "Aerial",
                        name: "Bing Aerial",
                        transitionEffect: 'resize'
                    },
                    {
                        isBaseLayer: true
                    }
                ],
                [
                    "OpenLayers.Layer.Bing",
                    {
                        key: "Ar00ZDTFpjaza5W0AvQrJq8lEuSgevERqr6MjpIXJHoV2vKnusZh1ExhLX6DTKLK",
                        type: "AerialWithLabels",
                        name: "Bing Aerial With Labels",
                        transitionEffect: 'resize'
                    },
                    {
                        isBaseLayer: true
                    }
                ],
                new OpenLayers.Layer.Image(
                    "None",
                    Ext.BLANK_IMAGE_URL,
                    OpenLayers.Bounds.fromString(Heron.options.map.settings.maxExtent),
                    new OpenLayers.Size(10, 10),
                    {
                        resolutions: [156543.033928, 78271.516964, 39135.758482, 19567.879241, 9783.9396205,
                            4891.96981025, 2445.98490513, 1222.99245256, 611.496226281, 305.748113141, 152.87405657,
                            76.4370282852, 38.2185141426, 19.1092570713, 9.55462853565, 4.77731426782, 2.38865713391,
                            1.19432856696, 0.597164283478, 0.298582141739],
                        isBaseLayer: true,
                        visibility: false,
                        displayInLayerSwitcher: true,
                        transitionEffect: 'resize'
                    }
                ),
                new OpenLayers.Layer.OSM("osm")
                /*new OpenLayers.Layer.XYZ(
                 "DigitalGlobe:Imagery",
                 "https://services.digitalglobe.com/earthservice/wmtsaccess?CONNECTID=" + "cc512ac4-bbf1-4279-972d-b698b47a0e22" + "&Service=WMTS&REQUEST=GetTile&Version=1.0.0&Format=image/png&Layer=" + "DigitalGlobe:ImageryTileService" + "&TileMatrixSet=EPSG:3857&TileMatrix=EPSG:3857:${z}&TileRow=${y}&TileCol=${x}",
                 {numZoomLevels: 20}
                 )*/
            ];
            $.ajax({
                url: host + "/api/v1/meta/" + db + "/" + schema,
                contentType: "application/json; charset=utf-8",
                scriptCharset: "utf-8",
                dataType: 'jsonp',
                jsonp: 'jsonp_callback',
                success: function (response) {
                    var groups = [], children = [], text, name, group, type, arr, lArr = [];
                    metaData = response;
                    for (var x = 0; x < metaData.data.length; x++) {
                        metaDataKeys[metaData.data[x].f_table_name] = metaData.data[x];
                        if (!metaData.data[x].f_table_title) {
                            metaData.data[x].f_table_title = metaData.data[x].f_table_name;
                        }
                        metaDataKeysTitle[metaData.data[x].f_table_title] = metaData.data[x];
                    }

                    $.each(response.data, function (i, v) {
                        text = (v.f_table_title === null || v.f_table_title === "") ? v.f_table_name : v.f_table_title;
                        name = v.f_table_schema + "." + v.f_table_name;
                        group = v.layergroup;
                        type = v.type;
                        lArr.push({text: text, name: name, group: group, type: type});
                        for (i = 0; i < response.data.length; i = i + 1) {
                            groups[i] = response.data[i].layergroup;
                        }
                        Heron.options.map.layers.push(
                            [
                                "OpenLayers.Layer.WMS",
                                name,
                                url,
                                {
                                    layers: name,
                                    format: 'image/png',
                                    transparent: true
                                },
                                {
                                    isBaseLayer: false,
                                    title: (!v.bitmapsource) ? text : " ",
                                    singleTile: false,
                                    visibility: false,
                                    transitionEffect: 'resize',
                                    featureInfoFormat: 'application/vnd.ogc.gml',
                                    metadata: {
                                        wfs: {
                                            protocol: new OpenLayers.Protocol.WFS({
                                                version: "1.0.0",
                                                url: '/wfs/' + db + '/' + schema + '/3857?',
                                                srsName: "EPSG:3857",
                                                featureType: v.f_table_name,
                                                featureNS: "http://twitter/" + db
                                            })
                                        }
                                    }

                                }
                            ]
                        );
                        Heron.options.map.layers.push(
                            new OpenLayers.Layer.Vector(name + "_v", {
                                strategies: [new OpenLayers.Strategy.BBOX()],
                                visibility: false,
                                title: (!v.bitmapsource) ? text : " ",
                                protocol: new OpenLayers.Protocol.WFS({
                                    version: "1.0.0",
                                    url: '/wfs/' + db + '/' + schema + '/3857?',
                                    srsName: "EPSG:3857",
                                    featureType: v.f_table_name,
                                    featureNS: "http://twitter/" + db
                                })
                            })
                        );
                    });
                    arr = array_unique(groups);
                    $.each(arr, function (u, m) {
                        var g;
                        g = {
                            text: m,
                            nodeType: 'hr_cascader',
                            children: []
                        };
                        $.each(lArr, function (i, v) {
                            if (m === v.group) {
                                /*if (v.type !== "RASTER") {
                                 g.children.push(
                                 {
                                 nodeType: "gx_layer",
                                 layer: v.name + "_v",
                                 text: v.text + " (WFS)",
                                 legend: false
                                 }
                                 );
                                 }*/
                                g.children.push(
                                    {
                                        nodeType: "gx_layer",
                                        layer: v.name,
                                        text: v.text,
                                        //text: v.text + " (WMS)",
                                        legend: false
                                    }
                                );

                            }
                        });
                        g.children.reverse();
                        children.push(g);
                    });
                    children.reverse();

                    Heron.options.layertree.tree = children.concat([
                        {
                            text: 'BaseLayers',
                            expanded: true,
                            children: [
                                {
                                    nodeType: "gx_layer",
                                    layer: "Google Streets",
                                    text: 'Google Streets'
                                }, {
                                    nodeType: "gx_layer",
                                    layer: "Google Terrain",
                                    text: 'Google Terrain'
                                },
                                {
                                    nodeType: "gx_layer",
                                    layer: "Google Hybrid",
                                    text: 'Google Hybrid'
                                },
                                {
                                    nodeType: "gx_layer",
                                    layer: "Google Satellite",
                                    text: 'Google Satellite'
                                },
                                {
                                    nodeType: "gx_layer",
                                    layer: "Bing Road",
                                    text: 'Bing Road'
                                },
                                {
                                    nodeType: "gx_layer",
                                    layer: "Bing Aerial",
                                    text: 'Bing Aerial'
                                },
                                {
                                    nodeType: "gx_layer",
                                    layer: "Bing Aerial With Labels",
                                    text: 'Bing Aerial With Labels'
                                },
                                {
                                    nodeType: "gx_layer",
                                    layer: "osm",
                                    text: 'Osm'
                                },
                                /*{
                                 nodeType: "gx_layer",
                                 layer: "DigitalGlobe:Imagery",
                                 text: 'DigitalGlobe:Imagery'
                                 },*/
                                {
                                    nodeType: "gx_layer",
                                    layer: "None",
                                    text: 'None'
                                }
                            ]
                        }
                    ]);
                    Heron.globals.metaReady = true;
                }
            });
        }
    }); // Ajax call end
};
MapCentia.init = function () {
    "use strict";
    OpenLayers.Util.onImageLoadErrorColor = "transparent";
    OpenLayers.ProxyHost = "/cgi/proxy.cgi?url=";
    //OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;

    Ext.BLANK_IMAGE_URL = 'http://cdnjs.cloudflare.com/ajax/libs/extjs/3.4.1-1/resources/images/default/s.gif';

    Heron.options.bookmarks = [];
    Heron.options.exportFormats = ['CSV', 'GMLv2', 'Shapefile',
        {
            name: 'Esri Shapefile (WGS84)',
            formatter: 'OpenLayersFormatter',
            format: 'OpenLayers.Format.GeoJSON',
            targetFormat: 'ESRI Shapefile',
            targetSrs: 'EPSG:4326',
            fileExt: '.zip',
            mimeType: 'application/zip'
        },
        'GeoJSON', 'WellKnownText'];

    Heron.options.wfs.downloadFormats = [
        {
            name: 'CSV',
            outputFormat: 'csv',
            fileExt: '.csv'
        },
        {
            name: 'GML (version 2.1.2)',
            outputFormat: 'text/xml; subtype=gml/2.1.2',
            fileExt: '.gml'
        },
        {
            name: 'ESRI Shapefile (zipped)',
            outputFormat: 'SHAPE-ZIP',
            fileExt: '.zip'
        },
        {
            name: 'GeoJSON',
            outputFormat: 'json',
            fileExt: '.json'
        }
    ];
    Heron.options.searchPanelConfig = {
        xtype: 'hr_multisearchcenterpanel',
        height: 600,
        hropts: [
            {
                searchPanel: {
                    xtype: 'hr_searchbydrawpanel',
                    name: __('Search by Drawing'),
                    header: false
                },
                resultPanel: {
                    xtype: 'hr_featuregridpanel',
                    id: 'hr-featuregridpanel',
                    header: false,
                    autoConfig: true,
                    autoConfigMaxSniff: 100,
                    exportFormats: Heron.options.exportFormats,
                    gridCellRenderers: Heron.options.gridCellRenderers,
                    hropts: {
                        zoomOnRowDoubleClick: true,
                        zoomOnFeatureSelect: false,
                        zoomLevelPointSelect: 8,
                        zoomToDataExtent: false
                    }
                }
            },
            {
                searchPanel: {
                    xtype: 'hr_searchbyfeaturepanel',
                    name: __('Search by Feature Selection'),
                    description: 'Select feature-geometries from one layer and use these to perform a spatial search in another layer.',
                    header: false,
                    border: false,
                    bodyStyle: 'padding: 6px',
                    style: {
                        fontFamily: 'Verdana, Arial, Helvetica, sans-serif',
                        fontSize: '12px'
                    }
                },
                resultPanel: {
                    xtype: 'hr_featuregridpanel',
                    id: 'hr-featuregridpanel',
                    header: false,
                    border: false,
                    autoConfig: true,
                    exportFormats: Heron.options.exportFormats,
                    gridCellRenderers: Heron.options.gridCellRenderers,
                    hropts: {
                        zoomOnRowDoubleClick: true,
                        zoomOnFeatureSelect: false,
                        zoomLevelPointSelect: 8,
                        zoomToDataExtent: false
                    }
                }
            },
            {
                searchPanel: {
                    xtype: 'hr_gxpquerypanel',
                    name: __('Build your own searches'),
                    description: 'This search uses both search within Map extent and/or your own attribute criteria',
                    header: false,
                    border: false,
                    caseInsensitiveMatch: true,
                    autoWildCardAttach: true
                },
                resultPanel: {
                    xtype: 'hr_featuregridpanel',
                    id: 'hr-featuregridpanel',
                    header: false,
                    border: false,
                    autoConfig: true,
                    exportFormats: ['XLS', 'GMLv2', 'GeoJSON', 'WellKnownText', 'Shapefile'],
                    gridCellRenderers: Heron.options.gridCellRenderers,
                    hropts: {
                        zoomOnRowDoubleClick: true,
                        zoomOnFeatureSelect: false,
                        zoomLevelPointSelect: 8,
                        zoomToDataExtent: true
                    }
                }
            }
        ]
    };
    Heron.options.map.toolbar = [
        {
            type: "any",
            options: {
                text: 'Info',
                enableToggle: true,
                tooltip: 'Query raster by click',
                toggleGroup: "rasterGroup",
                iconCls: 'icon-getfeatureinfo',
                id: "infoBtn",
                handler: function (e) {
                    try {
                        click.deactivate();
                        Heron.App.map.removeControl(click);
                        Heron.App.map.removeLayer(poilayer);
                    }
                    catch (e) {
                    }
                    try {
                        $.each(qstore, function (index, st) {
                            MapCentia.gc2.map.removeLayer(st.layer);
                        });
                    }
                    catch (e) {
                    }
                    try {
                        queryWin.hide();

                    }
                    catch (e) {
                    }
                    if (e.pressed === false) {
                        return false;
                    }
                    queryWin = new Ext.Window({
                        title: "Query result",
                        modal: false,
                        border: false,
                        layout: 'fit',
                        width: 400,
                        height: 400,
                        closeAction: 'hide',
                        x: 100,
                        y: 100,
                        plain: true,
                        listeners: {
                            hide: {
                                fn: function (el, e) {
                                    Ext.iterate(qstore, function (v) {
                                        v.reset();
                                    });
                                }
                            }
                        },
                        items: [
                            new Ext.TabPanel({
                                activeTab: 0,
                                frame: true,
                                id: "queryTabs",
                                tbar: []
                            })
                        ]
                    });

                    var clickController = OpenLayers.Class(OpenLayers.Control, {
                        defaultHandlerOptions: {
                            'single': true,
                            'double': false,
                            'pixelTolerance': 0,
                            'stopSingle': false,
                            'stopDouble': false
                        },
                        initialize: function (options) {
                            this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
                            OpenLayers.Control.prototype.initialize.apply(this, arguments);
                            this.handler = new OpenLayers.Handler.Click(this, {
                                'click': this.trigger
                            }, this.handlerOptions);
                        },
                        trigger: function (e) {
                            queryWin.show();
                            var layers, count = 0, hit = false, distance, db = "envimatix",
                                event = new geocloud.clickEvent(e, MapCentia.gc2),
                                coords = event.getCoordinate();
                            $.each(qstore, function (index, st) {
                                try {
                                    st.reset();
                                    MapCentia.gc2.removeGeoJsonStore(st);
                                }
                                catch (e) {

                                }
                            });
                            layers = MapCentia.gc2.getVisibleLayers().split(";");
                            Ext.getCmp("queryTabs").removeAll();
                            $.each(layers, function (index, value) {
                                var isEmpty = true;
                                var srid = metaDataKeys[value.split(".")[1]].srid;
                                var pkey = metaDataKeys[value.split(".")[1]].pkey;
                                var geoField = metaDataKeys[value.split(".")[1]].f_geometry_column;
                                var geoType = metaDataKeys[value.split(".")[1]].type;
                                var layerTitel = metaDataKeys[value.split(".")[1]].f_table_title || metaDataKeys[value.split(".")[1]].f_table_name;
                                var versioning = metaDataKeys[value.split(".")[1]].versioning;
                                qstore[index] = new geocloud.sqlStore({
                                    db: db,
                                    id: index,
                                    styleMap: new OpenLayers.StyleMap({
                                        "default": new OpenLayers.Style({
                                                fillColor: "#000000",
                                                fillOpacity: 0.0,
                                                pointRadius: 8,
                                                strokeColor: "#FF0000",
                                                strokeWidth: 3,
                                                strokeOpacity: 0.7,
                                                graphicZIndex: 3
                                            }
                                        )
                                    }),
                                    onLoad: function () {
                                        var layerObj = qstore[this.id], out = [], source = {}, pkeyValue;
                                        isEmpty = layerObj.isEmpty();
                                        if ((!isEmpty)) {
                                            queryWin.show();
                                            $.each(layerObj.geoJSON.features, function (i, feature) {
                                                $.each(feature.properties, function (name, property) {
                                                    out.push([name, 0, name, property]);
                                                });
                                                out.sort(function (a, b) {
                                                    return a[1] - b[1];
                                                });
                                                $.each(out, function (name, property) {
                                                    if (property[2] === pkey) {
                                                        pkeyValue = property[3];
                                                    }
                                                    source[property[2]] = parseFloat(property[3]).toFixed(3);
                                                });
                                                out = [];
                                            });
                                            Ext.getCmp("queryTabs").add(
                                                {
                                                    title: layerTitel,
                                                    layout: "fit",
                                                    border: false,
                                                    items: [
                                                        {
                                                            xtype: "panel",
                                                            layout: "fit",
                                                            id: layerTitel,
                                                            border: false,
                                                            items: [
                                                                new Ext.grid.PropertyGrid({
                                                                    autoHeight: false,
                                                                    border: false,
                                                                    startEditing: Ext.emptyFn,
                                                                    source: source
                                                                })
                                                            ]
                                                        }
                                                    ]
                                                }
                                            );
                                            hit = true;
                                        }
                                        if (!hit) {
                                            try {
                                                queryWin.hide();
                                            }
                                            catch (e) {
                                            }
                                        }
                                        count++;
                                        Ext.getCmp("queryTabs").activate(0);
                                    }
                                });
                                MapCentia.gc2.addGeoJsonStore(qstore[index]);
                                var sql, f_geometry_column = metaDataKeys[value.split(".")[1]].f_geometry_column;
                                if (geoType === "RASTER") {
                                    sql = "SELECT foo.the_geom,ST_Value(rast, foo.the_geom) As band1, ST_Value(rast, 2, foo.the_geom) As band2, ST_Value(rast, 3, foo.the_geom) As band3 " +
                                    "FROM " + value + " CROSS JOIN (SELECT ST_transform(ST_GeomFromText('POINT(" + coords.x + " " + coords.y + ")',3857)," + srid + ") As the_geom) As foo " +
                                    "WHERE ST_Intersects(rast,the_geom) ";
                                } else {
                                    if (geoType !== "POLYGON" && geoType !== "MULTIPOLYGON") {
                                        sql = "SELECT * FROM " + value + " WHERE round(ST_Distance(ST_Transform(\"" + f_geometry_column + "\",3857), ST_GeomFromText('POINT(" + coords.x + " " + coords.y + ")',3857))) < " + distance;
                                        if (versioning) {
                                            sql = sql + " AND gc2_version_end_date IS NULL";
                                        }
                                        sql = sql + " ORDER BY round(ST_Distance(ST_Transform(\"" + f_geometry_column + "\",3857), ST_GeomFromText('POINT(" + coords.x + " " + coords.y + ")',3857)))";
                                    } else {
                                        sql = "SELECT * FROM " + value + " WHERE ST_Intersects(ST_Transform(ST_geomfromtext('POINT(" + coords.x + " " + coords.y + ")',900913)," + srid + ")," + f_geometry_column + ")";
                                        if (versioning) {
                                            sql = sql + " AND gc2_version_end_date IS NULL";
                                        }
                                    }
                                }
                                sql = sql + " LIMIT 1";
                                qstore[index].sql = sql;
                                qstore[index].load();
                            });
                        }
                    });
                    click = new clickController();
                    Heron.App.map.addControl(click);
                    click.activate();

                }
            }
        },
        {type: "-"},
        {
            type: "any",
            options: {
                text: 'POI',
                tooltip: 'Plot graph from POIs',
                enableToggle: true,
                toggleGroup: "rasterGroup",
                id: "poiBtn",
                //iconCls: 'bmenu',
                handler: function (e) {
                    var num = 0;
                    try {
                        click.deactivate();
                        Heron.App.map.removeControl(click);
                        Heron.App.map.removeLayer(poilayer);
                    }
                    catch (e) {
                    }
                    try {
                        $.each(qstore, function (index, st) {
                            MapCentia.gc2.map.removeLayer(st.layer);
                        });
                    }
                    catch (e) {
                    }
                    try {
                        queryWin.hide();
                    }
                    catch (e) {
                    }
                    if (e.pressed === false) {

                        return false;
                    }
                    poilayer = new OpenLayers.Layer.Vector("Vector", {
                        styleMap: new OpenLayers.StyleMap({
                            "default": new OpenLayers.Style({
                                    fillColor: "#000000",
                                    fillOpacity: 0.0,
                                    pointRadius: 5,
                                    strokeColor: "#000000",
                                    strokeWidth: 3,
                                    strokeOpacity: 0.7,
                                    graphicZIndex: 3,
                                    label: "${num}",

                                    fontColor: "#000000",
                                    fontSize: "12px",
                                    fontFamily: "Courier New, monospace",
                                    fontWeight: "bold",
                                    labelOutlineColor: "white",
                                    labelOutlineWidth: 3
                                }
                            ),
                            "select": new OpenLayers.Style({
                                    fillColor: "#000000",
                                    fillOpacity: 0.0,
                                    pointRadius: 10,
                                    strokeColor: "#0000FF",
                                    strokeWidth: 3,
                                    strokeOpacity: 0.7,
                                    graphicZIndex: 3
                                }
                            )
                        })
                        //visibility: defaults.visibility,
                        //renderers: ['Canvas', 'SVG', 'VML'],
                        //rendererOptions: defaults.rendererOptions
                    });
                    Heron.App.map.addLayer(poilayer);
                    click = new OpenLayers.Control.DrawFeature(poilayer, OpenLayers.Handler.Point);
                    var modifyControl = new OpenLayers.Control.ModifyFeature(poilayer, {});
                    var selectControl = new OpenLayers.Control.SelectFeature(poilayer, {});

                    Heron.App.map.addControl(modifyControl);
                    Heron.App.map.addControl(selectControl);
                    Heron.App.map.addControl(click);
                    click.activate();
                    modifyControl.activate();
                    //selectControl.activate();
                    click.events.register("featureadded", this, function (e) {
                        e.feature.attributes = {
                            num: poilayer.features.length
                        };
                        poilayer.redraw();
                    });
                    queryWin = new Ext.Window({
                        title: "POI graph",
                        modal: false,
                        border: false,
                        layout: 'fit',
                        width: 500,
                        height: 300,
                        closeAction: 'close',
                        x: 100,
                        y: 100,
                        plain: true,
                        listeners: {
                            hide: {
                                fn: function (el, e) {
                                    Ext.iterate(qstore, function (v) {
                                        v.reset();
                                    });
                                    if (Ext.getCmp("poiBtn").pressed) {
                                        Ext.getCmp("poiBtn").toggle();
                                    }
                                    try {
                                        click.deactivate();
                                        Heron.App.map.removeControl(click);
                                        Heron.App.map.removeLayer(poilayer);
                                    }
                                    catch(e) {

                                    }
                                }
                            }
                        },
                        items: [
                            new Ext.TabPanel({
                                activeTab: 0,
                                frame: true,
                                id: "queryTabs",
                                tbar: [new GeoExt.Action({
                                    control: click,
                                    text: "<i class='icon-pencil btn-gc'></i> " + __("Draw"),
                                    enableToggle: true,
                                    tooltip: "Toggle on to draw point. Off to drag and delete points."
                                }),
                                    {
                                        text: "Delete",
                                        tooltip: "Delete the selected point",
                                        handler: function () {
                                            var feature = poilayer.selectedFeatures[0];
                                            modifyControl.unselectFeature(feature);
                                            poilayer.removeFeatures(feature);
                                            for (var i = 0; i < poilayer.features.length; i = i + 1) {
                                                poilayer.features[i].attributes = {
                                                    num: i + 1
                                                };
                                            }
                                            poilayer.redraw();
                                        }
                                    }, '-',
                                    {
                                        text: "Graph",
                                        tooltip: "Plot graph",
                                        handler: function () {
                                            getData();
                                        }
                                    }
                                ]
                            })
                        ]
                    });
                    queryWin.show();
                    var getData = function (e) {
                        var coords = [], stores = [], comboData = [], mins = [], maxs = [], layerTitles = [];
                        for (var i = 0; i < poilayer.features.length; i++) {
                            coords.push([poilayer.features[i].geometry.x, poilayer.features[i].geometry.y]);
                        }
                        var layers, count = 0, hit = false, db = "envimatix";
                        $.each(qstore, function (index, st) {
                            try {
                                st.reset();
                                MapCentia.gc2.removeGeoJsonStore(st);
                            }
                            catch (e) {
                            }
                        });
                        layers = MapCentia.gc2.getVisibleLayers().split(";");
                        Ext.getCmp("queryTabs").removeAll();
                        $.each(layers, function (index, value) {
                            var isEmpty = true;
                            var srid = metaDataKeys[value.split(".")[1]].srid;
                            var pkey = metaDataKeys[value.split(".")[1]].pkey;
                            var geoField = metaDataKeys[value.split(".")[1]].f_geometry_column;
                            var geoType = metaDataKeys[value.split(".")[1]].type;
                            var layerTitel = metaDataKeys[value.split(".")[1]].f_table_title || metaDataKeys[value.split(".")[1]].f_table_name;
                            qstore[index] = new geocloud.sqlStore({
                                db: db,
                                id: index,
                                jsonp: false,
                                method: "post",
                                styleMap: new OpenLayers.StyleMap({
                                    "default": new OpenLayers.Style({
                                            fillColor: "#000000",
                                            fillOpacity: 0.0,
                                            pointRadius: 8,
                                            strokeColor: "#FF0000",
                                            strokeWidth: 3,
                                            strokeOpacity: 0.7,
                                            graphicZIndex: 3
                                        }
                                    )
                                }),
                                onLoad: function () {
                                    var layerObj = qstore[this.id], out = [], source = {}, pkeyValue, data = [];
                                    isEmpty = layerObj.isEmpty();
                                    if ((!isEmpty)) {
                                        queryWin.show();
                                        $.each(layerObj.geoJSON.features, function (i, feature) {
                                            $.each(feature.properties, function (name, property) {
                                                out.push([name, 0, name, property]);
                                            });
                                            out.sort(function (a, b) {
                                                return a[1] - b[1];
                                            });
                                            $.each(out, function (name, property) {
                                                if (property[2] === pkey) {
                                                    pkeyValue = property[3];
                                                }
                                                source[i + " " + property[2]] = property[3];
                                            });
                                            data.push({num: i, properties: feature.properties});

                                            out = [];
                                        });
                                        for (i = 0; i < data.length; i = i + 1) {
                                            data[i] = {
                                                num: i + 1,
                                                value: Math.round(+(data[i].properties.mean_band1) * 1000) / 1000
                                            };
                                        }
                                        var store = new Ext.data.JsonStore({
                                            fields: ['num', 'value'],
                                            data: data
                                        });
                                        store.sort('value', 'ASC');
                                        var min = store.data.items[0].data.value;

                                        store.sort('value', 'DESC');
                                        var max = store.data.items[0].data.value;

                                        // Add a small buffer
                                        var diff = max - min;
                                        max = max + (diff / 20);
                                        min = min - (diff / 20);
                                        mins.push(min);
                                        maxs.push(max);
                                        layerTitles.push(layerTitel);
                                        store.sort('num', 'ASC');
                                        stores.push(data);
                                        Ext.getCmp("queryTabs").add(
                                            {
                                                title: layerTitel,
                                                layout: "fit",
                                                border: false,
                                                items: [
                                                    {
                                                        xtype: "panel",
                                                        layout: "fit",
                                                        id: layerTitel,
                                                        border: false,
                                                        items: [
                                                            {
                                                                xtype: 'linechart',
                                                                store: store,
                                                                xField: 'num',
                                                                listeners: {
                                                                    itemclick: function (o) {
                                                                        var rec = store.getAt(o.index);
                                                                        Ext.example.msg('Item Selected', 'You chose {0}.', rec.get('name'));
                                                                    }
                                                                },
                                                                series: [{
                                                                    type: 'line',
                                                                    yField: 'value'
                                                                }],
                                                                yAxis: new Ext.chart.NumericAxis({
                                                                    maximum: max,
                                                                    minimum: min,
                                                                    roundMajorUnit: false,
                                                                    majorUnit: Math.ceil((max - min) / data.length * 1000) / 1000
                                                                }),
                                                                chartStyle: {
                                                                    padding: 10,
                                                                    animationEnabled: true,
                                                                    font: {
                                                                        name: 'Tahoma',
                                                                        color: 0x444444,
                                                                        size: 11
                                                                    },
                                                                    dataTip: {
                                                                        padding: 5,
                                                                        border: {
                                                                            color: 0x99bbe8,
                                                                            size: 1
                                                                        },
                                                                        background: {
                                                                            color: 0xDAE7F6,
                                                                            alpha: 0.9
                                                                        },
                                                                        font: {
                                                                            name: 'Tahoma',
                                                                            color: 0x15428B,
                                                                            size: 10,
                                                                            bold: true
                                                                        }
                                                                    },
                                                                    xAxis: {
                                                                        color: 0x69aBc8,
                                                                        majorTicks: {color: 0x69aBc8, length: 4},
                                                                        minorTicks: {color: 0x69aBc8, length: 2},
                                                                        majorGridLines: {size: 1, color: 0xeeeeee}
                                                                    },
                                                                    yAxis: {
                                                                        color: 0x69aBc8,
                                                                        majorTicks: {color: 0x69aBc8, length: 4},
                                                                        minorTicks: {color: 0x69aBc8, length: 2},
                                                                        majorGridLines: {size: 1, color: 0xdfe8f6}
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        );
                                        hit = true;
                                    }
                                    if (!hit) {
                                        try {
                                            queryWin.hide();
                                        }
                                        catch (e) {
                                        }
                                    }
                                    count++;
                                    Ext.getCmp("queryTabs").activate(0);
                                }
                            });
                            MapCentia.gc2.addGeoJsonStore(qstore[index]);
                            var sql, f_geometry_column = metaDataKeys[value.split(".")[1]].f_geometry_column;
                            var unions = [];
                            for (var i = 0; i < coords.length; i++) {
                                unions.push(
                                    "SELECT * FROM (" +
                                    "WITH " +
                                    "pixelsize as (" +
                                    "SELECT ST_PixelWidth(rast) as width, ST_NumBands(rast) as numbands from " + value + " limit 1), " +
                                    "rastunion as (" +
                                    "SELECT ST_SetSRID(ST_union(rast)," + srid + ") as rast FROM " + value + ", pixelsize " +
                                    "WHERE ST_Intersects(rast,ST_buffer(ST_Transform(ST_GeomFromText('POINT(" + coords[i][0] + " " + coords[i][1] + ")',3857)," + srid + "),30))" +
                                    ")," +
                                    "pixel as (" +
                                    "SELECT (ST_WorldToRasterCoord(rast,ST_Transform(ST_GeomFromText('POINT(" + coords[i][0] + " " + coords[i][1] + ")',3857)," + srid + "))  ).* from rastunion)" +
                                    "," +
                                    "map as (" +
                                    "SELECT " +
                                    "ST_MapAlgebra(rast, 1, 'ST_Mean4ma(double precision[], integer[], text[])'::regprocedure, NULL, NULL, NULL, 1, 1) as newrast1 " +
                                        //"ST_MapAlgebra(rast, 2, 'ST_Mean4ma(double precision[], integer[], text[])'::regprocedure, NULL, NULL, NULL, 1, 1) as newrast2," +
                                        //"ST_MapAlgebra(rast, 3, 'ST_Mean4ma(double precision[], integer[], text[])'::regprocedure, NULL, NULL, NULL, 1, 1) as newrast3 " +
                                    "from rastunion) " +
                                    "Select " + i + " as sortid," +
                                        //"ST_Neighborhood(rast, 1, columnx, rowy, 1, 1) as neighborhood_band1," +
                                        //"ST_Neighborhood(rast, 2, columnx, rowy, 1, 1) as neighborhood_band2," +
                                        //"ST_Neighborhood(rast, 3, columnx, rowy, 1, 1) as neighborhood_band3," +
                                    "foo.the_geom, " +
                                    "ST_Value(newrast1, 1, foo.the_geom) as mean_band1 " +
                                        //"CASE WHEN pixelsize.numbands > 1 THEN (ST_Value(newrast2, 1, foo.the_geom)) ELSE 'Nan' END as mean_band2," +
                                        //"CASE WHEN pixelsize.numbands > 2 THEN (ST_Value(newrast3, 1, foo.the_geom)) ELSE 'Nan' END as mean_band3 " +
                                        //"pixel.* " +
                                    "FROM rastunion, pixel, map " +
                                    "CROSS JOIN (SELECT ST_Transform(ST_GeomFromText('POINT(" + coords[i][0] + " " + coords[i][1] + ")',3857)," + srid + ") As the_geom) As foo ORDER BY sortid" +
                                    ") as final "
                                );
                            }
                            sql = unions.join(" UNION ");
                            qstore[index].sql = sql;
                            qstore[index].load();

                        });
                        (function pollForQueries() {
                            if (layers.length === count) {
                                var obj = {}, fields = ['num'], series = [], min = mins.sort()[0], max = maxs.sort(function (a, b) {
                                    return b - a
                                })[0];
                                for (var n = 0; n < poilayer.features.length; n = n + 1) {
                                    obj.num = n;
                                    for (var u = 0; u < stores.length; u = u + 1) {
                                        obj["value" + u] = stores[u][n].value;
                                    }
                                    comboData.push(obj);
                                    obj = {};
                                }
                                for (n = 0; n < stores.length; n = n + 1) {
                                    fields.push("value" + n);
                                    series.push({
                                        displayName: layerTitles[n],
                                        type: 'line',
                                        yField: "value" + n
                                    });
                                }
                                var store = new Ext.data.JsonStore({
                                    fields: fields,
                                    data: comboData
                                });

                                var diff = max - min;
                                max = max + (diff / 20);
                                min = min - (diff / 20);

                                Ext.getCmp("queryTabs").add(
                                    {
                                        title: "Combo",
                                        layout: "fit",
                                        border: false,
                                        items: [
                                            {
                                                xtype: "panel",
                                                layout: "fit",
                                                id: "combo",
                                                border: false,
                                                items: [
                                                    {
                                                        xtype: 'linechart',
                                                        store: store,
                                                        xField: 'num',
                                                        listeners: {
                                                            itemclick: function (o) {
                                                                var rec = store.getAt(o.index);
                                                                Ext.example.msg('Item Selected', 'You chose {0}.', rec.get('name'));
                                                            }
                                                        },
                                                        series: series,
                                                        yAxis: new Ext.chart.NumericAxis({
                                                            maximum: max,
                                                            minimum: min,
                                                            roundMajorUnit: false,
                                                            majorUnit: Math.ceil((max - min) / comboData.length * 1000) / 1000
                                                        }),
                                                        chartStyle: {
                                                            padding: 10,
                                                            animationEnabled: true,
                                                            font: {
                                                                name: 'Tahoma',
                                                                color: 0x444444,
                                                                size: 11
                                                            },
                                                            dataTip: {
                                                                padding: 5,
                                                                border: {
                                                                    color: 0x99bbe8,
                                                                    size: 1
                                                                },
                                                                background: {
                                                                    color: 0xDAE7F6,
                                                                    alpha: 0.9
                                                                },
                                                                font: {
                                                                    name: 'Tahoma',
                                                                    color: 0x15428B,
                                                                    size: 10,
                                                                    bold: true
                                                                }
                                                            },
                                                            xAxis: {
                                                                color: 0x69aBc8,
                                                                majorTicks: {color: 0x69aBc8, length: 4},
                                                                minorTicks: {color: 0x69aBc8, length: 2},
                                                                majorGridLines: {size: 1, color: 0xeeeeee}
                                                            },
                                                            yAxis: {
                                                                color: 0x69aBc8,
                                                                majorTicks: {color: 0x69aBc8, length: 4},
                                                                minorTicks: {color: 0x69aBc8, length: 2},
                                                                majorGridLines: {size: 1, color: 0xdfe8f6}
                                                            }
                                                        },
                                                        extraStyle: {
                                                            legend: {
                                                                display: 'bottom',
                                                                padding: 5,
                                                                font: {
                                                                    family: 'Tahoma',
                                                                    size: 13
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                );
                            } else {
                                setTimeout(pollForQueries, 10);
                            }
                        }());
                    };


                }
            }
        },
        {type: "-"},
        {type: "pan"},
        {type: "zoomin"},
        {type: "zoomout"},
        {type: "zoomvisible"},
        {type: "coordinatesearch", options: {onSearchCompleteZoom: 8}},
        {type: "-"},
        {type: "zoomprevious"},
        {type: "zoomnext"},
        {type: "-"},
    /** Use "geodesic: true" for non-linear/Mercator projections like Google, Bing etc */
        {type: "measurelength", options: {geodesic: true}},
        {type: "measurearea", options: {geodesic: true}},
        {type: "-"},
        {type: "addbookmark"}
    ]

    Heron.layout = {
        xtype: 'panel',
        id: 'hr-container-main',
        layout: 'border',
        border: false,

        /** Any classes in "items" and nested items are automatically instantiated (via "xtype") and added by ExtJS. */
        items: [
            {
                xtype: 'panel',
                id: 'hr-menu-left-container',
                layout: 'accordion',
                region: "west",
                width: 240,
                collapsible: true,
                border: false,
                items: [
                    {
                        xtype: 'hr_layertreepanel',
                        border: true,
                        layerIcons: 'bylayertype',
                        contextMenu: [
                            {
                                xtype: 'hr_layernodemenulayerinfo'
                            },
                            {
                                xtype: 'hr_layernodemenuzoomextent'
                            },
                            {
                                xtype: 'hr_layernodemenustyle'
                            },
                            {
                                xtype: 'hr_layernodemenuopacityslider'
                            }
                        ],
                        hropts: Heron.options.layertree
                    },
                    {
                        xtype: 'hr_bookmarkspanel',
                        id: 'hr-bookmarks',
                        border: true,
                        /** The map contexts to show links for in the BookmarksPanel. */
                        hropts: Heron.options.bookmarks
                    }
                ]
            },
            {
                xtype: 'panel',
                id: 'hr-map-and-info-container',
                layout: 'border',
                region: 'center',
                width: '100%',
                collapsible: false,
                split: false,
                border: false,
                items: [
                    {
                        xtype: 'hr_mappanel',
                        id: 'hr-map',
                        title: '&nbsp;',
                        region: 'center',
                        collapsible: false,
                        border: false,
                        hropts: Heron.options.map
                    }
                ]
            }
        ]
    };
};

MapCentia.setup();
(function pollForLayers() {
    if (Heron.globals.metaReady) {
        MapCentia.init();
        Heron.App.create();
        Heron.App.show();
        MapCentia.gc2 = new geocloud.map({});
        MapCentia.gc2.map = Heron.App.map;
    } else {
        setTimeout(pollForLayers, 10);
    }
}());


