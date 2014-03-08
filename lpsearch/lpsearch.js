var cowiLpSearch = (function () {
    "use strict";
    var cloudMap,
        init_search = function (conf) {
            //cloudMap = new mygeocloud_ol.map("map", db);
            //cloudMap.map.zoomToExtent(bbox);
            (function () {
                var store;
                var names = [];
                var map = {};
                var search = _.debounce(function (query, process) {
                    map = {};
                    $.ajax({
                        url: 'http://eu1.mapcentia.com/api/v1/elasticsearch/search/dk/planer/lokalplaner',
                        data: '&q={"query":{"filtered":{"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(query.toLowerCase()) + '","default_operator":"AND"}},"filter":{"term":{"komnr":"' + conf.komnr + '"}}}}}',
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
                $('#lp').typeahead({
                    source: function (query, process) {
                        search(query, process);
                    },
                    updater: function (item) {
                        var selectedGid = map[item];
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
                    store.sql = "SELECT planid FROM planer.lokalplan_vedtaget WHERE gid=" + gid;
                    store.load();
                };
                store = new geocloud.geoJsonStore({
                        db: "dk",
                        sql: null,
                        onLoad: function () {
                            //cloudMap.zoomToExtentOfgeoJsonStore(store);
                            //cloudMap.map.addLayers([store.layer]);
                            window.open("http://mygeocloud.cowi.webhouse.dk/apps/custom/planurl/public/index.php/api/v1/url/" + conf.db + "/" + conf.table + "/" + store.geoJSON.features[0].properties.planid);
                        }
                    });
            }());
            return cloudMap;
        };
    return {
        init_search: init_search
    };
}());
