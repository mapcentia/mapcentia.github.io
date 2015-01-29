var search = (function () {
    var layerObj = {"name": {}, "url": {}},
        cloudMap,
        addLegend,
        hostname = "http://eu1.mapcentia.com",
        callback = function (obj) {
            for (var i = 0; i < obj.data.length; i++) {
                layerObj.name[obj.data[i].f_table_name] = obj.data[i].f_table_title;
                layerObj.url[obj.data[i].f_table_name] = obj.data[i].meta_url;
            }
        },
        switchLayer = function (id, visible) {
            cloudMap.getLayersByName(id).setVisibility(visible || false);
            addLegend();
        },
        init_search = function (db, komKode, layers, bbox, callback) {
            cloudMap = new geocloud.map({el: "map", db: db});
            cloudMap.addBaseLayer(geocloud.OSM);
            cloudMap.setBaseLayer(geocloud.OSM);
            cloudMap.map.zoomToExtent(bbox);

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
                //store.sql = "SELECT gid,the_geom,ST_astext(the_geom) as wkt FROM matrikel.jordstykke WHERE gid=" + gid;

                if (typeFlag === "jordstykke") {
                    store.sql = "SELECT gid,the_geom,ST_astext(the_geom) as wkt FROM matrikel.jordstykke WHERE gid=" + gid;
                }
                if (typeFlag === "adresse") {
                    store.sql = "SELECT gid,the_geom,ST_astext(the_geom) as wkt FROM adresse.adgang WHERE gid=" + gid;
                }
                store.load();
                //conflict(wkt)
            };

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
                type2 = (query.match(/\d+/g) != null) ? "jordstykke" : "ejerlav";
                map = {};
                responseType = {};
                $.ajax({
                    url: hostname + '/api/v1/elasticsearch/search/dk/aws/' + type1,
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
                            url: hostname + '/api/v1/elasticsearch/search/dk/matrikel/' + type2,
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
                                process(names);
                                names = [];
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
                    var selectedGid = (type1 === "adresse" || type2 === "jordstykke") ? map[item] : null;
                    typeFlag = responseType[item];
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
                /*var storeLp = new geocloud.geoJsonStore("dk");
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
                 $('#result-table').append("<tr><td></td><td>Lokalplaner</td></tr>");

                 for (var i = 0; i < f.length; i++) {
                 $('#result-table').append("<tr><td></td><td><a target='_blank' href=" + f[i].properties.doklink + ">" + f[i].properties.plannr + " " + f[i].properties.plannavn + "</a></td></tr>");
                 }
                 }
                 };*/
                // Lp search end

                var store = [];
                $("#spinner").show();
                for (var i = 0; i < arr.length; i++) {
                    store[i] = new geocloud.geoJsonStore({db: db});
                    store[i].sql = "SELECT * FROM " + arr[i] + " WHERE ST_intersects(the_geom,ST_SetSRID(ST_geomfromtext('" + wkt + "'),25832))"
                    store[i].id = arr[i];
                    store[i].load();
                    store[i].onLoad = function () {
                        if (typeof this.geoJSON !== null && this.geoJSON.features !== undefined) {
                            cloudMap.addTileLayers({
                                db: db,
                                layers: [this.id],
                                name: this.id,
                                visibility: false
                            });
                            if (layerObj.url[this.id.split('.')[1]] !== null && layerObj.url[this.id.split('.')[1]] !== "") {
                                $('#result-table').append("<tr><td class='checkbox'><input type='checkbox' onclick='search.switchLayer(\"" + this.id + "\",this.checked)'></td><td class='layer-name'><a target='_blank' href='" + layerObj.url[this.id.split('.')[1]] + "'>" + layerObj.name[this.id.split('.')[1]] + "</a></td></tr>");
                            }
                            else {
                                $('#result-table').append("<tr><td class='checkbox'><input type='checkbox' onclick='search.switchLayer(\"" + this.id + "\",this.checked)'></td><td class='layer-name'>" + layerObj.name[this.id.split('.')[1]] + "</td></tr>");
                            }
                            if (this.id.split('.')[1] === "kpplandk2_view") {
                                $.each(this.geoJSON.features,
                                    function (key, value) {
                                        $('#result-table').append("<tr><td></td><td><a target='_blank' href=" + value.properties.html + ">" + value.properties.plannr + "</a></td></tr>");
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
            return map;
        };
    return {
        callback: callback,
        switchLayer: switchLayer,
        init_search: init_search,
        cloudMap: cloudMap
    };
})();
