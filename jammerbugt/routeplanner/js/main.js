(function () {
    "use strict";
    var map, directionsDisplay, directionsService, list = [], autocomplete, bar, modal, specArr = [];

    function search(origin) {
        var i = 0, l, cclass, arr = [];
        $.each(gc2dest.features, function (index, value) {
            if ($("#speciel-input").val() === value.properties.forenkletspeciale) {
                arr.push(value);
            }
        });
        l = arr.length;
        $('#tweetContainer').empty();
        $("#search-progress").empty();
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
                if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
                    $('#tweetContainer').empty();
                    $("#search-progress").empty();
                    bar.removeClass('animate');
                    modal.modal('hide');
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
                    }
                    else if (value.leg.distance.value > 50000) {
                        cclass = "red";
                    }
                    else {
                        cclass = "";
                    }
                    $('#tweetContainer').append(
                        '<section><a href="javascript:void(0)" class="list-group-item ' + cclass + '" data-id=\"' +
                            value.custom.gid +
                            '">' +
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
                });
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
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map);
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
        $.each(gc2dest.features, function (index, value) {
            if (specArr.indexOf(value.properties.forenkletspeciale) === -1) {
                specArr.push(value.properties.forenkletspeciale);
                $("#speciel-input").append("<option value='" + value.properties.forenkletspeciale + "'>" + value.properties.forenkletspeciale + "</option>")
            }
        });
    }

    google.maps.event.addDomListener(window, 'load', init);
}());