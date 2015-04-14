var search = (function () {
    var layerObj = {"name": {}, "url": {}},
        callback = function (obj) {
            for (var i = 0; i < obj.data.length; i++) {
                layerObj.name[obj.data[i].f_table_name] = obj.data[i].f_table_title;
                layerObj.url[obj.data[i].f_table_name] = obj.data[i].meta_url;
            }
        },

        init = function (db, komKode, mapObj) {
            var store;
            var call_counter = 0;
            var names = [];
            var map = {};
            var type1 = "";
            var type2 = "";
            var responseType = {};
            var typeFlag;

            store = new geocloud.geoJsonStore({
                host: "http://eu1.mapcentia.com",
                db: "dk",
                sql: null,
                onLoad: function () {
                    mapObj.zoomToExtentOfgeoJsonStore(this);
                    mapObj.map.addLayers([this.layer]);
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
                    url: 'http://eu1.mapcentia.com/api/v1/elasticsearch/search/dk/aws/' + type1,
                    //data: 'call_counter=' + (++call_counter) + '&size=8&q={"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(query.toLowerCase().replace(",", "")) + '","default_operator":"AND"}}}',
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
                            //data: 'call_counter=' + (++call_counter) + '&size=8&q={"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(query.toLowerCase()) + '","default_operator":"AND"}}}',
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
                    var flag = false;
                    _(arr).each(
                        function (s) {
                            if (item.toLowerCase().indexOf($.trim(s).toLowerCase()) === false) {
                                flag = false;
                            }
                            else flag = true;
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
        };
    return {
        init: init
    };
})();
