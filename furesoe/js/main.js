(function () {
    "use strict";
    $.getJSON("config/form.json", function () {
        //console.log("success");
    })
        .done(function (data) {
            var form = data.form, host = data.gc2.host, db = data.gc2.db, table = data.gc2.table, valueField = data.gc2.valueField, geomField = data.gc2.geomField, coords, marker, clicktimer, escape,
                count = 0,
                zoomControl = L.control.zoom({
                    position: 'bottomright'
                }),
                gc2 = new geocloud.map(
                    {
                        el: "map",
                        zoomControl: false
                    }
                );
            gc2.map.addControl(zoomControl);

            // Add a base layer
            gc2.addBaseLayer("osm");

            // Set the base layer active
            gc2.setBaseLayer("osm");

            // Access the native Leaflet map object
            gc2.map.setView(data.map.center, data.map.zoom);

            gc2.on("dblclick", function () {
                clicktimer = undefined;
            });
            gc2.on("click", function (e) {
                if (clicktimer) {
                    clearTimeout(clicktimer);
                } else {
                    clicktimer = setTimeout(function () {
                        coords = e.latlng;
                        clicktimer = undefined;
                        if (count === 3) {
                            alert("Kun 3 registreringer!");
                            return false;
                        }
                        marker = L.marker(coords, {
                            icon: L.AwesomeMarkers.icon(
                                {
                                    icon: 'star',
                                    markerColor: 'blue',
                                    prefix: 'fa'
                                }
                            )
                        }).addTo(gc2.map)
                            .bindPopup('<form style="height: 200px" class="form-group"></form>', {minWidth: 300})
                            .openPopup().on("popupclose", function (e) {
                                e.target._map.removeLayer(e.target);
                            });
                        form.onSubmit = function (errors, values) {
                            if (errors) {
                                alert();
                            } else {
                                escape = function (str) {
                                    // TODO: escape %x75 4HEXDIG ?? chars
                                    return str
                                        .replace(/[\"]/g, '')
                                        .replace(/[\&]/g, '')
                                        .replace(/[\\]/g, '\\\\')
                                        .replace(/[\/]/g, '\\/')
                                        .replace(/[\b]/g, '\\b')
                                        .replace(/[\f]/g, '\\f')
                                        .replace(/[\n]/g, '\\n')
                                        .replace(/[\r]/g, '\\r')
                                        .replace(/[\t]/g, '\\t');
                                };
                                $.each(values, function (k, v) {
                                    values[k] = escape(v);
                                });

                                $.ajax({
                                    type: "POST",
                                    url: host + "/api/v1/collector/" + db,
                                    data: JSON.stringify({
                                        coords: coords,
                                        values: values,
                                        db: db,
                                        table: table,
                                        valueField: valueField,
                                        geomField: geomField
                                    }),
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json",
                                    success: function (data) {
                                        L.marker(coords,
                                            {
                                                icon: L.AwesomeMarkers.icon(
                                                    {
                                                        icon: 'star',
                                                        markerColor: 'red',
                                                        prefix: 'fa'
                                                    }
                                                )
                                            }).addTo(gc2.map).bindPopup(values.name + "<br>" + values.email).openPopup();
                                        count = count + 1;
                                    },
                                    failure: function (errMsg) {
                                        //console.log(errMsg);
                                    },
                                    error: function (xhr) {
                                        alert('Et eller gik galt. Refresh din browser og prøv igen');
                                    }
                                });
                                try {
                                    gc2.map.removeLayer(marker);
                                } catch (e) {
                                    //console.log(e.message)
                                }
                            }
                            return false;
                        };
                        $('form').jsonForm(form);
                    }, 250);
                }
            });
        })
        .fail(function () {
            //console.log("error");
        })
        .always(function () {
            //console.log("complete");
        });
}());