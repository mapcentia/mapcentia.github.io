(function () {
    var map, input, highlighter, search, elastic, markerMap = {};

    $("input[name=search-input]").keyup(function () {
        if (!this.value) {
            $('#tweetContainer').empty();
        }
    });

    $("input[name=search-input]").on('input', _.debounce(function (e) {
        search(e.target.value);
    }, 300));

    search = function (value) {
        $('#tweetContainer').empty();
        if (value) {
            $.ajax({
                url: 'http://eu1.mapcentia.com/api/v1/elasticsearch/search/esbjerg/kommuneplan14/retningslinjer/',
                data: 'q={"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(value.toLowerCase()) + '"}}}',
                contentType: "application/json; charset=iso-8859-1",
                scriptCharset: "iso-8859-1",
                dataType: 'jsonp',
                jsonp: 'jsonp_callback',
                success: function (response) {
                    $.each(response.hits.hits, function (i, hit) {
                        $('#tweetContainer').append(
                            '<section>' +
                                '<h4 class="list-group-item-heading">' +
                                hit._source.properties.titel +
                                '</h4>' +
                                '<p class="list-group-item-text">' +
                                '<div>Retningslinje</div>' +
                                '<div>' + highlighter(value, hit._source.properties.retningslinje) + '</div>' +
                                '<div>Redegørelse</div>' +
                                '<div>' + highlighter(value, hit._source.properties.redegoerelse) + '</div>' +
                                '</p>' +
                                '</section>'
                        );
                    });
                }
            });
            /*elastic.q = '{"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(value.toLowerCase()) + '"}}}';
             //elastic.q = '{"query":{"query_string":{"query":"' + encodeURIComponent(value.toLowerCase()) + '"}}}';
             elastic.load();
             $('#tweetContainer').empty();
             elastic.onLoad = function () {
             for (var i = 0; i < this.geoJSON.features.length; i++) {
             var tweet = this.geoJSON.features[i];
             $('#tweetContainer').append(
             '<section>' +
             '<h4 class="list-group-item-heading">' +
             tweet.properties.titel +
             '</h4>' +
             '<p class="list-group-item-text">' +
             '<div>Retningslinje</div>' +
             '<div>' + (value, tweet.properties.retningslinje) + '</div>' +
             '<div>Redegørelse</div>' +
             '<div>' + (value, tweet.properties.redegoerelse) + '</div>' +
             '</p>' +
             '</section>'
             );
             }
             $('a.list-group-item').on("click", function (e) {
             var tweetId = $(this).data('tweetid');
             var marker = markerMap[tweetId];
             marker.openPopup(marker.getLatLng());
             var x = marker.feature.geometry.coordinates[1];
             var y = marker.feature.geometry.coordinates[0];
             var p = new R.Pulse(
             [x, y],
             30,
             {'stroke': 'none', 'fill': 'none'},
             {'stroke': '#30a3ec', 'stroke-width': 3});

             map.map.addLayer(p);
             setTimeout(function () {
             map.map.removeLayer(p);
             }, 1000);
             });
             }*/
        }
    };
    highlighter = function (value, item) {
        _($.trim(value).split(' ')).each(
            function (s) {
                var regex = new RegExp('(' + s + ')', 'gi');
                item = item.replace(regex, "<b class=\"highlighted\">$1</b>");
            }
        );
        return item;
    };
}());
