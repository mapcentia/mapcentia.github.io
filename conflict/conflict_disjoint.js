var cowi = (function () {
    var layerObj = {};
    layerObj.name = {};
    layerObj.url = {};
    var cloudMap,
        addLegend,
        hostname = "http://cowi.mapcentia.com",
        callback = function (obj) {
        for (var i = 0; i < obj.data.length; i++) {
            layerObj.name[obj.data[i].f_table_name] = obj.data[i].f_table_title;
            layerObj.url[obj.data[i].f_table_name] = obj.data[i].meta_url;
        }
    };
    var switchLayer = function (id, visible) {
        (visible) ? cloudMap.map.getLayersByName(id)[0].setVisibility(true) : cloudMap.map.getLayersByName(id)[0].setVisibility(false);
        addLegend();
    };
    var init_search = function (db, komKode, layers, bbox, callback, baseLayer, useAreaWithAddress) {
        cloudMap = new mygeocloud_ol.map("map", db);
        cloudMap.addBaseLayer(baseLayer || "dtkSkaermkortDaempet");
        cloudMap.setBaseLayer(baseLayer || "dtkSkaermkortDaempet");

        //cloudMap.map.zoomToExtent(bbox);
        var storeBorder = new geocloud.geoJsonStore({
            db: "dk",
            sql: "select * from admin.kommuner where komkode='0" + komKode + "'",styleMap: new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                        fillColor: "#000000",
                        fillOpacity: 0.0,
                        pointRadius: 8,
                        strokeColor: "#000000",
                        strokeWidth: 3,
                        strokeOpacity: 0.5,
                        graphicZIndex: 3
                    }
                )
            }),
            lifetime: 9999999
        });
        // Add the store as a vector overlay
        // Fire the SQL
        storeBorder.load();
        // Define a callback for when the SQL returns
        storeBorder.onLoad = function () {
            // Zoom to vector layer
            cloudMap.map.addLayers([storeBorder.layer]);

            cloudMap.zoomToExtentOfgeoJsonStore(storeBorder);
        };
        $("#result").append("<div id='spinner' style='display:none'><img src='http://mapcentia.github.io/conflict/ajax-loader.gif'></div>");
        var style = {
            "color": "#ff0000",
            "weight": 5,
            "opacity": 0.65
        };
        $.ajax({
            url: hostname + '/api/v1/meta/' + db,
            dataType: 'jsonp',
            jsonp: 'jsonp_callback',
            success: function (obj) {
                for (var i = 0; i < obj.data.length; i++) {
                    layerObj.name[obj.data[i].f_table_name] = obj.data[i].f_table_title;
                    layerObj.url[obj.data[i].f_table_name] = obj.data[i].meta_url;
                }
            }
        });
        addLegend = function () {
            $.ajax({
                url: hostname + '/api/v1/legend/html/' + db,
                data: 'l=' + cloudMap.getVisibleLayers(),
                dataType: 'jsonp',
                jsonp: 'jsonp_callback',
                success: function (response) {
                    $('#legendContent').html(response.html);
                }
            });
        };

        (function () {
            var store;
            var call_counter = 0;
            var names = [];
            var map = {};
            var type = "";
            var search = _.debounce(function (query, process) {
                if (query.match(/\d+/g) === null && query.match(/\s+/g) === null) {
                    type = "vejnavn,bynavn";
                }
                if (query.match(/\d+/g) === null && query.match(/\s+/g) !== null) {
                    type = "vejnavn_bynavn";
                }
                if (query.match(/\d+/g) !== null) {
                    type = "adresse";
                }
                map = {};
                $.ajax({
                    url: 'http://eu1.mapcentia.com/api/v1/elasticsearch/search/dk/aws/' + type,
                    data: 'call_counter=' + (++call_counter) + '&q={"query":{"filtered":{"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(query.toLowerCase().replace(",", "")) + '","default_operator":"AND"}},"filter":{"term":{"municipalitycode":"0' + komKode + '"}}}}}',
                    contentType: "application/json; charset=utf-8",
                    scriptCharset: "utf-8",
                    dataType: 'jsonp',
                    jsonp: 'jsonp_callback',
                    success: function (response) {
                        $.each(response.hits.hits, function (i, hit) {
                            var str = hit._source.properties.string;
                            map[str] = hit._source.properties.gid;
                            names.push(str);
                        });
                        process(names);
                        names = [];
                    }
                });
            }, 200);
            $('#a_search').typeahead({
                source: function (query, process) {
                    search(query, process);
                },
                updater: function (item) {
                    var selectedGid = (type === "adresse") ? map[item] : null;
                    if (selectedGid) {
                        showOnMap(selectedGid);
                    }
                    return item;
                },
                matcher: function (item) {
                    var arr = this.query.split(' ');
                    var flag = false
                    _(arr).each(
                        function (s) {
                            if (item.toLowerCase().indexOf($.trim(s).toLowerCase()) === false) {
                                flag = false;
                            }
                            else flag = true;
                        }
                    )
                    return flag;
                },
                sorter: function (items) {
                    return items.sort();
                },
                highlighter: function (item) {
                    _($.trim(this.query).split(' ')).each(
                        function (s) {
                            var regex = new RegExp('(' + s + ')', 'gi');
                            item = item.replace(regex, "<b>$1</b>");
                        }
                    );
                    return item;
                },
                items: 10
            });
            var showOnMap = function (gid) {
                store.reset();
                if (useAreaWithAddress) {
                    store.sql = "SELECT adresse.adgang.the_geom as a_the_geom,matrikel.jordstykke.the_geom as m_the_geom,ST_astext(adresse.adgang.the_geom) as a_wkt,ST_astext(matrikel.jordstykke.the_geom) as wkt FROM adresse.adgang, matrikel.jordstykke WHERE ST_intersects(matrikel.jordstykke.the_geom, adresse.adgang.the_geom) AND adresse.adgang.gid=" + gid;
                } else {
                    store.sql = "SELECT gid,the_geom,ST_astext(the_geom) as wkt FROM adresse.adgang WHERE gid=" + gid;
                }
                store.load();
            };
            store = new geocloud.geoJsonStore({
                db: "dk",
                sql: null,
                onLoad: function () {
                    cloudMap.zoomToExtentOfgeoJsonStore(store);
                    cloudMap.map.addLayers([store.layer]);
                    conflict(store.geoJSON.features[0].properties.wkt, type);
                }
            });
        })();

        (function () {
            var store;
            var call_counter = 0;
            var names = [];
            var map = {};
            var type = "";
            var search = _.debounce(function (query, process) {
                type = (query.match(/\d+/g) != null) ? "jordstykke" : "ejerlav";
                map = {};
                $.ajax({
                    url: 'http://eu1.mapcentia.com/api/v1/elasticsearch/search/dk/matrikel/' + type,
                    data: 'call_counter=' + (++call_counter) + '&q={"query":{"filtered":{"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(query.toLowerCase()) + '","default_operator":"AND"}},"filter":{"term":{"komkode":"' + komKode + '"}}}}}',
                    dataType: 'jsonp',
                    contentType: "application/json; charset=utf-8",
                    scriptCharset: "utf-8",
                    jsonp: 'jsonp_callback',
                    success: function (response) {
                        $.each(response.hits.hits, function (i, hit) {
                            var str = hit._source.properties.string;
                            map[str] = hit._source.properties.gid;
                            names.push(str);
                        });
                        process(names);
                        names = [];
                    }
                });
            }, 200);
            $('#m_search').typeahead({
                source: function (query, process) {
                    search(query, process);
                },
                updater: function (item) {
                    var selectedGid = (type === "jordstykke") ? map[item] : null;
                    if (selectedGid) {
                        showOnMap(selectedGid);
                    }
                    return item;
                },
                matcher: function (item) {
                    var arr = this.query.split(' ');
                    var flag = false
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
                },
                highlighter: function (item) {
                    _($.trim(this.query).split(' ')).each(
                        function (s) {
                            var regex = new RegExp('(' + s + ')', 'gi');
                            item = item.replace(regex, "<b>$1</b>");
                        }
                    )
                    return item;
                },
                items: 10
            });
            var showOnMap = function (gid) {
                store.reset();
                store.sql = "SELECT gid,the_geom,ST_astext(the_geom) as wkt FROM matrikel.jordstykke WHERE gid=" + gid;
                store.load();
            };
            store = new geocloud.geoJsonStore({
                db: "dk",
                sql: null,
                onLoad: function () {
                    cloudMap.zoomToExtentOfgeoJsonStore(store);
                    cloudMap.map.addLayers([store.layer]);
                    conflict(store.geoJSON.features[0].properties.wkt, type);
                }
            });
        })();
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
            var storeLp = new mygeocloud_ol.geoJsonStore("dk");
            if (type === "jordstykke") {
                storeLp.sql = "SELECT * FROM planer.lokalplan_vedtaget WHERE ST_intersects(the_geom,ST_Buffer(ST_SetSRID(ST_geomfromtext('" + wkt + "'),25832),-5))";
            }
            else {
                storeLp.sql = "SELECT * FROM planer.lokalplan_vedtaget WHERE ST_intersects(the_geom,ST_SetSRID(ST_geomfromtext('" + wkt + "'),25832))";

            }
            storeLp.load();
            storeLp.onLoad = function () {
                var f = this.geoJSON.features;
                if (typeof this.geoJSON.features === "object") {
                    $('#result-table').append("<tr><td></td><td class='layer-name'>Lokalplaner</td></tr>");

                    for (var i = 0; i < f.length; i++) {
                        $('#result-table').append("<tr><td></td><td><a target='_blank' href=" + f[i].properties.doklink + ">" + f[i].properties.plannr + " " + f[i].properties.plannavn + "</a></td></tr>");
                    }
                }
            };
            // Lp search end

            var store = [];
            $("#spinner").show();
            for (var i = 0; i < arr.length; i++) {
                store[i] = new mygeocloud_ol.geoJsonStore(db);
                store[i].sql = "SELECT * FROM " + arr[i] + " WHERE ST_intersects(the_geom,ST_SetSRID(ST_geomfromtext('" + wkt + "'),25832))";
                store[i].sql += (arr[i].split('.')[1] === "kpplandk2_view") ? " AND (status = 'forslag' OR status = 'vedtaget')" : "";
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
                                    $('#result-table').append("<tr><td></td><td><a target='_blank' href=" + value.properties.html + ">" + value.properties.plannr + "</a></td></tr>");
                                });
                        }
                        if (this.id.split('.')[1] === "delopland_view") {
                            $.each(this.geoJSON.features,
                                function (key, value) {
                                    $('#result-table').append("<tr><td></td><td>" + value.properties.titel + " | " + value.properties.tekst + "</td></tr>");
                                });
                        }
                    }
                    count++;
                    if (count === arr.length) {
                        $("#spinner").hide();
                    }
                }
            }
            store = null;
        };
        return cloudMap;
    };
    return {
        callback: callback,
        switchLayer: switchLayer,
        init_search: init_search
    };
})();
