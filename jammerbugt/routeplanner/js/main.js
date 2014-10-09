(function () {
    "use strict";
    var map, directionsDisplay, directionsService, list = [], autocomplete, bar, modal, specArr = [], markers = [], homeMarker, geoCoder, bounds;

    function search(origin) {
        var i = 0, l, cclass, arr = [], marker, infowindow, ll;
        bounds = new google.maps.LatLngBounds();

        // Filter and sort the destinations
        $.each(gc2dest.features, function (index, value) {
            if ($("#speciel-input").val() === value.properties.forenkletspeciale) {
                arr.push(value);
            }
        });
        l = arr.length;

        // Clean up the map
        $.each(markers, function (index, value) {
            value.setMap(null);
        });
        markers = [];
        if (directionsDisplay !== undefined) {
            directionsDisplay.setMap(null);
        }
        if (homeMarker !== undefined) {
            homeMarker.setMap(null);
        }

        // Set home marker from address
        geoCoder = new google.maps.Geocoder();
        geoCoder.geocode({ 'address': origin}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                homeMarker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
                bounds.extend(results[0].geometry.location);
            } else {
                alert('Kunne ikke finde adresse: ' + status);
            }
        });

        // Setup direction service
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map);
        directionsDisplay.setOptions({ suppressMarkers: true });

        // Clean up the list
        $('#tweetContainer').empty();
        $("#search-progress").empty();

        // Start iterations
        (function iterator() {
            var request = {
                    origin: origin,
                    destination: arr[i].properties.samlet_adresse,
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                custom = {
                    gid: arr[i].properties.gid,
                    navn: arr[i].properties.navn,
                    speciale: arr[i].properties.speciale
                };
            directionsService.route(request, function (response, status) {
                if (response === null || status === google.maps.DirectionsStatus.ZERO_RESULTS) {
                    $('#tweetContainer').empty();
                    $("#search-progress").empty();
                    bar.removeClass('animate');
                    modal.modal('hide');
                    alert("En eller flere rutevejledninger mislykkedes. Prøv at lave søgningen igen");
                    return;
                }
                if (status === google.maps.DirectionsStatus.OK) {
                    var leg = response.routes[0].legs[0];
                    list.push({
                        distance: leg.distance.value,
                        request: request,
                        leg: leg,
                        custom: custom
                    });
                    $("#search-progress").append("<p>" + request.destination + "</p>");
                    if (++i < l) {
                        setTimeout(iterator, 500);
                    }
                }
            });
        }());
        (function pollForIterator() {
            if (i === l) {
                bar.removeClass('animate');
                modal.modal('hide');
                list.sort(function (a, b) {
                    if (a.distance < b.distance)
                        return -1;
                    if (a.distance > b.distance)
                        return 1;
                    return 0;
                });
                $.each(list, function (index, value) {
                    if (index === 0) {
                        cclass = "green";
                    } else if (value.leg.distance.value > 50000) {
                        cclass = "red";
                    } else {
                        cclass = "";
                    }
                    $('#tweetContainer').append(
                        '<section><a href="javascript:void(0)" class="list-group-item ' + cclass + '" data-id=\"' +
                            value.custom.gid +
                            '">' +
                            '<div class="number">' + (index + 1) + '</div>' +
                            '<h4 class="list-group-item-heading">' +
                            value.leg.distance.text +
                            '</h4>' +
                            '<p class="list-group-item-text">' +
                            value.custom.navn +
                            '<br>' +
                            value.custom.speciale +
                            '<br>' +
                            value.request.destination +
                            '</p>' +
                            '<p class="list-group-item-text">' +
                            //highlighter(value, tweet.properties.text) +
                            '</p>' +
                            '</a></section>'
                    );
                    // Add markers
                    ll = new google.maps.LatLng(value.leg.end_location.k, value.leg.end_location.B);
                    marker = new google.maps.Marker({
                        position: ll,
                        map: map,
                        icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + (index + 1) + "|FF0000|000000"
                    });
                    infowindow = new google.maps.InfoWindow({
                        content: "<div>" +
                            value.leg.distance.text + "<br>" +
                            value.custom.speciale + "<br>" +
                            value.custom.navn + "<br>" +
                            value.request.destination + "<br>" +
                            "</div>"
                    });

                    google.maps.event.addListener(marker, 'click', (function (marker, infowindow) {
                        return function () {
                            infowindow.open(map, marker);
                        };
                    }(marker, infowindow)));
                    bounds.extend(ll);
                    markers.push(marker);
                });
                map.fitBounds(bounds);
                $('a.list-group-item').on("click", function (e) {
                    var id = $(this).data('id');
                    $(".list-group-item").addClass("unselected");
                    $(this).removeClass("unselected");
                    $(this).addClass("selected");
                    showRoute(id, origin)
                });

                list = [];
            } else {
                setTimeout(pollForIterator, 10);
            }
        }());
    }

    function showRoute(id, origin) {
        $.each(gc2dest.features, function (index, value) {
            if (id === value.properties.gid) {
                directionsService.route({
                    origin: origin,
                    destination: value.properties.samlet_adresse,
                    travelMode: google.maps.TravelMode.DRIVING
                }, function (response, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });

            }
        });
    }

    function init() {
        var mapOptions = {
            zoom: 8,
            center: new google.maps.LatLng(57, 9)
        };
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        autocomplete = new google.maps.places.Autocomplete(document.getElementById('search-input'));
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            search(place.formatted_address);
            modal = $('.js-loading-bar');
            bar = modal.find('.progress-bar');
            modal.modal('show');
            bar.addClass('animate');
        });
        $('.js-loading-bar').modal({
            backdrop: 'static',
            show: false
        });
        // Sort the destinations
        gc2dest.features.sort(function (a, b) {
            var nameA = a.properties.forenkletspeciale.toLowerCase(), nameB = b.properties.forenkletspeciale.toLowerCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        $.each(gc2dest.features, function (index, value) {
            if (specArr.indexOf(value.properties.forenkletspeciale) === -1) {
                specArr.push(value.properties.forenkletspeciale);
                $("#speciel-input").append("<option value='" + value.properties.forenkletspeciale + "'>" + value.properties.forenkletspeciale + "</option>")
            }
        });
    }

    google.maps.event.addDomListener(window, 'load', init);
}());