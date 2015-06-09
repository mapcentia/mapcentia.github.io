var cowi = (function () {
    var layerObj = {"name": {}, "url": {}},
        cloudMap,
        addLegend,
        callback = function (obj) {
            for (var i = 0; i < obj.data.length; i++) {
                layerObj.name[obj.data[i].f_table_name] = obj.data[i].f_table_title;
                layerObj.url[obj.data[i].f_table_name] = obj.data[i].meta_url;
            }
        },
        switchLayer = function (id, visible) {
            (visible) ? cloudMap.map.getLayersByName(id)[0].setVisibility(true) : cloudMap.map.getLayersByName(id)[0].setVisibility(false);
            addLegend();
        },
        init_search = function (db, komKode, layers, bbox, callback) {
            cloudMap = new mygeocloud_ol.map("map", db, {
                //minResolution:  4.77731426782,
                maxResolution: 305.748113141,
                numZoomLevels: 10,
                controls: [
                    new OpenLayers.Control.Navigation(),
                    new OpenLayers.Control.PanZoomBar(),
                    //new OpenLayers.Control.LayerSwitcher(),
                    //new OpenLayers.Control.PanZoom(),
                    new OpenLayers.Control.Attribution(),
                    //new OpenLayers.Control.Zoom(),
                    new OpenLayers.Control.TouchNavigation({
                        dragPanOptions: {enableKinetic: true}
                    })]
            });

            cloudMap.addBaseLayer("dtkSkaermkortDaempet");
            cloudMap.zoomToExtent(bbox);
            cloudMap.addTileLayers(["admin.maske_esbjerg"], {
                    db: "dk"
                }
            );
            var storeDraw = new mygeocloud_ol.geoJsonStore("dk", {
                styleMap: new OpenLayers.StyleMap({
                    "default": new OpenLayers.Style(null, {
                        rules: [
                            new OpenLayers.Rule({
                                symbolizer: {
                                    "Point": {
                                        pointRadius: 5,
                                        graphicName: "square",
                                        fillColor: "white",
                                        fillOpacity: 0.25,
                                        strokeWidth: 2,
                                        strokeOpacity: 1,
                                        strokeColor: "#0000FF"
                                    },
                                    "Polygon": {
                                        strokeWidth: 3,
                                        strokeOpacity: 1,
                                        strokeColor: "#0000FF"
                                    }
                                }
                            })
                        ]
                    }),
                    "select": new OpenLayers.Style({
                        strokeColor: "#00ccff",
                        strokeWidth: 4
                    }),
                    "temporary": new OpenLayers.Style(null, {
                        rules: [
                            new OpenLayers.Rule({
                                symbolizer: {
                                    "Point": {
                                        pointRadius: 5,
                                        graphicName: "square",
                                        fillColor: "white",
                                        fillOpacity: 0.25,
                                        strokeWidth: 1,
                                        strokeOpacity: 1,
                                        strokeColor: "#333333"
                                    },
                                    "Polygon": {
                                        strokeWidth: 3,
                                        strokeOpacity: 1,
                                        strokeColor: "#00ccff"
                                    }
                                }
                            })
                        ]
                    })
                })
            });
            cloudMap.addGeoJsonStore(storeDraw);
            $("#flade").click(function () {
                storeDraw.pointControl.deactivate();
                storeDraw.layer.destroyFeatures();
                storeDraw.polygonControl.activate();
            });
            $("#punkt").click(function () {
                storeDraw.polygonControl.deactivate();
                storeDraw.layer.destroyFeatures();
                storeDraw.pointControl.activate();
            });
            $("#stop").click(function () {
                storeDraw.pointControl.deactivate();
                storeDraw.polygonControl.deactivate();
                storeDraw.layer.destroyFeatures();
            });
            storeDraw.layer.events.on({
                sketchcomplete: function (e) {
                    if (storeDraw.layer.features.length > 0) {
                        storeDraw.layer.destroyFeatures();
                        if (storeDraw.polygonControl.active) {
                            storeDraw.polygonControl.deactivate();
                            storeDraw.polygonControl.activate();
                        }
                        if (storeDraw.pointControl.active) {
                            storeDraw.pointControl.deactivate();
                            storeDraw.pointControl.activate();
                        }
                    }
                },
                featureadded: function (feature) {
                    var wkt;
                    var format = new OpenLayers.Format.WKT;
                    var g = new OpenLayers.Format.WKT;
                    try {
                        wkt = g.write(feature);
                    }
                    catch (e) {
                    }
                    try {
                        wkt = g.write(feature.feature);
                    }
                    catch (e) {
                    }
                    try {
                        wkt = g.write(feature.layer.features);
                    }
                    catch (e) {
                    }
                    try {
                        if (feature.features.length > 0) {
                            wkt = g.write(feature.features);
                        }
                        else wkt = "";
                    }
                    catch (e) {
                    }
                    conflict(wkt, "draw");

                }
            });

            $("#result").append("<div id='spinner' style='display:none'><img src='http://mapcentia.github.io/conflict/ajax-loader.gif'></div>");
            var style = {
                "color": "#ff0000",
                "weight": 5,
                "opacity": 0.65
            };
            document.write('<script src="http://eu1.mapcentia.com/api/v1/meta/esbjerg?jsonp_callback=cowi.callback"><\/script>');
            addLegend = function () {
                var hostname = "http://eu1.mapcentia.com";
                var layers = cloudMap.getVisibleLayers();
                var param = 'l=' + layers;
                $.ajax({
                    url: "http://eu1.mapcentia.com/api/v1/legend/html/esbjerg/?" + param,
                    dataType: 'jsonp',
                    jsonp: 'jsonp_callback',
                    success: function (response) {
                        $('#legendContent').html(response.html);

                    }
                });
            };
            var store;
            var call_counter = 0;
            var names = [];
            var map = {};
            var type1 = "";
            var type2 = "";
            var responseType = {};
            var typeFlag;

            store = new geocloud.geoJsonStore({
                db: "dk",
                sql: null,
                onLoad: function () {
                    cloudMap.zoomToExtentOfgeoJsonStore(store);
                    cloudMap.map.addLayers([store.layer]);
                    conflict(store.geoJSON.features[0].properties.wkt, typeFlag);
                }
            });

            var showOnMap = function (gid) {
                store.reset();
                if (typeFlag === "jordstykke") {
                    store.db = "dk";
                    store.sql = "SELECT gid,the_geom,ST_astext(ST_transform(the_geom,900913)) as wkt FROM matrikel.jordstykke WHERE gid=" + gid;
                }
                else if (typeFlag === "adresse") {
                    store.db = "dk";
                    store.sql = "SELECT gid,the_geom,ST_astext(ST_transform(the_geom,900913)) as wkt FROM adresse.adgang WHERE gid=" + gid;
                }
                else {
                    store.db = "esbjerg";
                    store.sql = "SELECT gid,the_geom,ST_astext(ST_transform(the_geom,900913)) as wkt FROM kommuneplan14.kpplandk2 WHERE gid=" + gid;
                }
                store.load();
            };
            var createSearch = function (me) {
                var type1, type2, gids = [], searchString,
                    placeStore = new geocloud.geoJsonStore({
                        host: "http://eu1.mapcentia.com",
                        db: "dk",
                        sql: null,
                        pointToLayer: null,
                        onLoad: function () {
                            cloudMap.zoomToExtentOfgeoJsonStore(placeStore);
                            conflict(this.geoJSON.features[0].properties.wkt);
                        }
                    });
                cloudMap.map.addLayers([placeStore.layer]);
                $('#custom-search').typeahead({
                    highlight: false
                }, {
                    name: 'adresse',
                    displayKey: 'value',
                    templates: {
                        header: '<h2 class="typeahead-heading">Adresser</h2>'
                    },
                    source: function (query, cb) {
                        if (query.match(/\d+/g) === null && query.match(/\s+/g) === null) {
                            type1 = "vejnavn,bynavn";
                        }
                        if (query.match(/\d+/g) === null && query.match(/\s+/g) !== null) {
                            type1 = "vejnavn_bynavn";
                        }
                        if (query.match(/\d+/g) !== null) {
                            type1 = "adresse";
                        }
                        var names = [];

                        (function ca() {
                            $.ajax({
                                url: 'http://eu1.mapcentia.com/api/v1/elasticsearch/search/dk/aws/' + type1,
                                data: '&q={"query":{"filtered":{"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(query.toLowerCase().replace(",", "")) + '","default_operator":"AND"}},"filter":{"term":{"municipalitycode":"0' + komKode + '"}}}}}',
                                contentType: "application/json; charset=utf-8",
                                scriptCharset: "utf-8",
                                dataType: 'jsonp',
                                jsonp: 'jsonp_callback',
                                success: function (response) {
                                    $.each(response.hits.hits, function (i, hit) {
                                        var str = hit._source.properties.string;
                                        gids[str] = hit._source.properties.gid;
                                        names.push({value: str});
                                    });
                                    if (names.length === 1 && (type1 === "vejnavn,bynavn" || type1 === "vejnavn_bynavn")) {
                                        type1 = "adresse";
                                        names = [];
                                        gids = [];
                                        ca();
                                    } else {
                                        cb(names);
                                    }
                                }
                            })
                        })();
                    }
                }, {
                    name: 'matrikel',
                    displayKey: 'value',
                    templates: {
                        header: '<h2 class="typeahead-heading">Matrikel</h2>'
                    },
                    source: function (query, cb) {
                        var names = [];
                        type2 = (query.match(/\d+/g) != null) ? "jordstykke" : "ejerlav";
                        (function ca() {
                            $.ajax({
                                url: 'http://eu1.mapcentia.com/api/v1/elasticsearch/search/dk/matrikel/' + type2,
                                data: '&q={"query":{"filtered":{"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(query.toLowerCase()) + '","default_operator":"AND"}},"filter":{"term":{"komkode":"' + komKode + '"}}}}}',
                                contentType: "application/json; charset=utf-8",
                                scriptCharset: "utf-8",
                                dataType: 'jsonp',
                                jsonp: 'jsonp_callback',
                                success: function (response) {
                                    $.each(response.hits.hits, function (i, hit) {
                                        var str = hit._source.properties.string;
                                        gids[str] = hit._source.properties.gid;
                                        names.push({value: str});
                                    });
                                    if (names.length === 1 && (type2 === "ejerlav")) {
                                        type2 = "jordstykke";
                                        names = [];
                                        gids = [];
                                        ca();
                                    } else {
                                        cb(names);
                                    }
                                }
                            });
                        })();
                    }
                }, {
                    name: 'kpplandk2',
                    displayKey: 'value',
                    templates: {
                        header: '<h2 class="typeahead-heading">Rammer</h2>'
                    },
                    source: function (query, cb) {
                        var names = [];
                        type2 = (query.match(/\d+/g) != null) ? "jordstykke" : "ejerlav";
                        (function ca() {
                            $.ajax({
                                url: 'http://eu1.mapcentia.com/api/v1/elasticsearch/search/esbjerg/kommuneplan14/kpplandk2',
                                data: '&q={"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(query.toLowerCase()).replace(/-/g, "_") + '"}}}',
                                dataType: 'jsonp',
                                contentType: "application/json; charset=utf-8",
                                scriptCharset: "utf-8",
                                jsonp: 'jsonp_callback',
                                success: function (response) {
                                    $.each(response.hits.hits, function (i, hit) {
                                        var str = hit._source.properties.string.replace(/_/g, "-");
                                        gids[str] = hit._source.properties.gid;
                                        names.push({value: str});
                                    });
                                    cb(names);
                                }
                            });
                        })();
                    }
                });
                $('#custom-search').bind('typeahead:selected', function (obj, datum, name) {
                    if (name === "kpplandk2"){
                        placeStore.reset();
                        searchString = datum.value;
                        placeStore.db = "esbjerg";
                        placeStore.sql = "SELECT gid,the_geom,ST_astext(ST_transform(the_geom,900913)) as wkt FROM kommuneplan14.kpplandk2 WHERE gid=" + gids[datum.value];
                        placeStore.load();
                    }
                    else if ((type1 === "adresse" && name === "adresse") || (type2 === "jordstykke" && name === "matrikel")) {
                        placeStore.reset();
                        placeStore.db = "dk";
                        if (name === "matrikel") {
                            placeStore.sql = "SELECT gid,the_geom,ST_astext(ST_transform(the_geom,900913)) as wkt FROM matrikel.jordstykke WHERE gid=" + gids[datum.value];
                        }
                        if (name === "adresse") {
                            placeStore.sql = "SELECT gid,the_geom,ST_astext(ST_transform(the_geom,900913)) as wkt FROM adresse.adgang WHERE gid=" + gids[datum.value];
                        }
                        searchString = datum.value;
                        placeStore.load();
                    } else {
                        setTimeout(function () {
                            $(".typeahead").val(datum.value + " ").trigger("paste").trigger("input");
                        }, 100);
                    }
                });
            };
            createSearch();
            var search = _.debounce(function (query, process) {
                if (query.match(/\d+/g) === null && query.match(/\s+/g) === null) {
                    type1 = "vejnavn,bynavn";
                }
                if (query.match(/\d+/g) === null && query.match(/\s+/g) !== null) {
                    type1 = "vejnavn_bynavn";
                }
                if (query.match(/\d+/g) !== null) {
                    type1 = "adresse";
                }
                type2 = (query.match(/\d+/g) !== null) ? "jordstykke" : "ejerlav";
                map = {};
                responseType = {};
                $.ajax({
                    url: 'http://eu1.mapcentia.com/api/v1/elasticsearch/search/dk/aws/' + type1,
                    data: 'call_counter=' + (++call_counter) + '&q={"query":{"filtered":{"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(query.toLowerCase().replace(",", "")) + '","default_operator":"AND"}},"filter":{"term":{"municipalitycode":"0' + komKode + '"}}}}}',
                    contentType: "application/json; charset=utf-8",
                    scriptCharset: "utf-8",
                    dataType: 'jsonp',
                    jsonp: 'jsonp_callback',
                    success: function (response) {
                        $.each(response.hits.hits, function (i, hit) {
                            var str = hit._source.properties.string;
                            responseType[str] = hit._type;
                            map[str] = hit._source.properties.gid;
                            names.push(str);
                        });
                        $.ajax({
                            url: 'http://eu1.mapcentia.com/api/v1/elasticsearch/search/dk/matrikel/' + type2,
                            data: 'call_counter=' + (++call_counter) + '&q={"query":{"filtered":{"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(query.toLowerCase()) + '","default_operator":"AND"}},"filter":{"term":{"komkode":"' + komKode + '"}}}}}',
                            dataType: 'jsonp',
                            contentType: "application/json; charset=utf-8",
                            scriptCharset: "utf-8",
                            jsonp: 'jsonp_callback',
                            success: function (response) {
                                $.each(response.hits.hits, function (i, hit) {
                                    var str = hit._source.properties.string;
                                    responseType[str] = hit._type;
                                    map[str] = hit._source.properties.gid;
                                    names.push(str);
                                });
                                if (query.match(/\s+/g) === null) {
                                    $.ajax({
                                        url: 'http://eu1.mapcentia.com/api/v1/elasticsearch/search/esbjerg/kommuneplan14/kpplandk2',
                                        data: '&q={"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(query.toLowerCase()).replace(/-/g, "_") + '"}}}',
                                        dataType: 'jsonp',
                                        contentType: "application/json; charset=utf-8",
                                        scriptCharset: "utf-8",
                                        jsonp: 'jsonp_callback',
                                        success: function (response) {
                                            $.each(response.hits.hits, function (i, hit) {
                                                var str = hit._source.properties.string.replace(/_/g, "-");
                                                responseType[str] = hit._type;
                                                map[str] = hit._source.properties.gid;
                                                names.push(str);
                                            });
                                            process(names);
                                            names = [];
                                        }
                                    });
                                }
                                else {
                                    process(names);
                                    names = [];
                                }
                            }
                        });
                    }
                });
            }, 0);
            $('#m_search').typeahead({
                items: 16,
                source: function (query, process) {
                    search(query, process);
                },
                updater: function (item) {
                    typeFlag = responseType[item];
                    if (map[item]) {
                        showOnMap(map[item]);
                    }
                    return item;
                },
                matcher: function (item) {
                    var arr = this.query.split(' ');
                    var flag = false;
                    _(arr).each(
                        function (s) {
                            if (item.toLowerCase().indexOf($.trim(s).toLowerCase()) === false) {
                                flag = false;
                            }
                            else {
                                flag = true;
                            }
                        }
                    );
                    return flag;

                },
                sorter: function (items) {
                    return items.sort();
                    //return items;
                },
                highlighter: function (item) {
                    _($.trim(this.query).split(' ')).each(
                        function (s) {
                            var regex = new RegExp('(' + s + ')', 'gi');
                            item = item.replace(regex, "<b>$1</b>");
                        }
                    );
                    return item;
                }
            });

            var conflict = function (wkt, type) {
                var count = 0;
                var arr = layers;
                $("#result-table").empty();
                try {
                    callback();
                }
                catch (e) {
                }

                // Lp search
                var storeLp = new mygeocloud_ol.geoJsonStore("dk", {
                    jsonp: true,
                    method: "GET"
                });
                var storeLpFor = new mygeocloud_ol.geoJsonStore("dk", {
                    jsonp: true,
                    method: "GET"
                });
                if (type !== "adresse" && type !== "draw") {
                    storeLp.sql = "SELECT * FROM planer.lokalplan_vedtaget WHERE ST_intersects((ST_transform(the_geom,900913)),ST_Buffer(ST_SetSRID(ST_geomfromtext('" + wkt + "'),900913),-5)) AND komnr=" + komKode;
                    storeLpFor.sql = "SELECT * FROM planer.lokalplan_forslag WHERE ST_intersects((ST_transform(the_geom,900913)),ST_Buffer(ST_SetSRID(ST_geomfromtext('" + wkt + "'),900913),-5)) AND komnr=" + komKode;
                }
                else {
                    storeLp.sql = "SELECT * FROM planer.lokalplan_vedtaget WHERE ST_intersects((ST_transform(the_geom,900913)),ST_SetSRID(ST_geomfromtext('" + wkt + "'),900913)) AND komnr=" + komKode;
                    storeLpFor.sql = "SELECT * FROM planer.lokalplan_forslag WHERE ST_intersects((ST_transform(the_geom,900913)),ST_SetSRID(ST_geomfromtext('" + wkt + "'),900913)) AND komnr=" + komKode;
                }
                storeLp.load();
                storeLpFor.load();
                storeLp.onLoad = function () {
                    var f = this.geoJSON.features;
                    if (typeof this.geoJSON.features === "object") {
                        $('#result-table').append("<tr><td></td><td>Lokalplaner</td></tr>");
                        for (var i = 0; i < f.length; i++) {
                            $('#result-table').append("<tr><td></td><td><a target='_blank' href=" + f[i].properties.doklink + ">" + f[i].properties.plannr + " " + f[i].properties.plannavn + "</a></td></tr>");
                        }
                    }
                };
                storeLpFor.onLoad = function () {
                    var f = this.geoJSON.features;
                    if (typeof this.geoJSON.features === "object") {
                        $('#result-table').append("<tr><td></td><td>Lokalplanforslag</td></tr>");
                        for (var i = 0; i < f.length; i++) {
                            $('#result-table').append("<tr><td></td><td><a target='_blank' href=" + f[i].properties.doklink + ">" + f[i].properties.plannr + " " + f[i].properties.plannavn + "</a></td></tr>");
                        }
                    }
                };
                // Lp search end

                var store = [];
                $("#spinner").show();
                for (var i = 0; i < arr.length; i++) {
                    store[i] = new mygeocloud_ol.geoJsonStore(db, {
                        jsonp: true,
                        method: "GET",
                        clientEncoding: "UTF8"
                    });
                    if (type === "kpplandk2") {
                        store[i].sql = "SELECT * FROM " + arr[i] + " WHERE ST_intersects((ST_transform(the_geom,900913)),ST_Buffer(ST_SetSRID(ST_geomfromtext('" + wkt + "'),900913),-5))";
                    } else {
                        store[i].sql = "SELECT * FROM " + arr[i] + " WHERE ST_intersects((ST_transform(the_geom,900913)),ST_SetSRID(ST_geomfromtext('" + wkt + "'),900913))";
                    }
                    store[i].id = arr[i];
                    store[i].load();
                    store[i].onLoad = function () {
                        if (this.geoJSON.features !== undefined) {
                            cloudMap.addTileLayers([this.id], {
                                name: this.id,
                                visibility: false
                            });
                            if (layerObj.url[this.id.split('.')[1]] !== null && layerObj.url[this.id.split('.')[1]] !== "") {
                                $('#result-table').append("<tr><td class='checkbox'><input type='checkbox' onclick='cowi.switchLayer(\"" + this.id + "\",this.checked)'></td><td class='layer-name'><a target='_blank' href='" + layerObj.url[this.id.split('.')[1]] + "'>" + layerObj.name[this.id.split('.')[1]] + "</a></td></tr>");
                            }
                            else {
                                $('#result-table').append("<tr><td class='checkbox'><input type='checkbox' onclick='cowi.switchLayer(\"" + this.id + "\",this.checked)'></td><td class='layer-name'>" + layerObj.name[this.id.split('.')[1]] + "</td></tr>");
                            }
                            if (this.id.split('.')[1] === "kpplandk2_view") {
                                $.each(this.geoJSON.features,
                                    function (key, value) {
                                        $('#result-table').append("<tr><td></td><td><a target='_blank' href='/dk/mit_lokalomraade/ramme.htm?enrid=" + value.properties.enrid + "'>" + value.properties.enrid + " " + value.properties.enavn + "</a></td></tr>");
                                    });
                            }
                        }
                        count++;
                        if (count === arr.length) {
                            $("#spinner").hide();
                        }
                    };
                }
                store = null;
            };
            return cloudMap;
        };
    return {
        callback: callback,
        switchLayer: switchLayer,
        init_search: init_search,
        cloudMap: cloudMap
    };
})();
