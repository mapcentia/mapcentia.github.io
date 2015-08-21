/*global geocloud:false */
/*global geocloud_host:false */
/*global $:false */
/*global jQuery:false */
/*global L:false */
/*global Base64:false */
/*global array_unique:false */
/*global google:false */
/*global mygeocloud_ol:false */
/*global schema:false */
/*global document:false */
/*global window:false */
var Viewer, print;
Viewer = function (obj, callback) {
    "use strict";
    var init, switchLayer, setBaseLayer, addLegend, hostname, cloud, db, schema, hash, zoomControl, metaDataKeys = [], metaDataKeysTitle = [], metaDataReady = false, settingsReady = false, urlVars;
    hostname = "http://cowi.mapcentia.com";
    urlVars = geocloud.urlVars;
    db = obj.db;
    schema = obj.schemas.join(",");
    switchLayer = function (name, visible) {
        if (visible) {
            cloud.showLayer(name);
            $('*[data-gc2-id="' + name + '"]').prop('checked', true);
        } else {
            cloud.hideLayer(name);
            $('*[data-gc2-id="' + name + '"]').prop('checked', false);
        }
        addLegend();
    };
    setBaseLayer = function (str) {
        cloud.setBaseLayer(str);
        addLegend();
    };
    addLegend = function () {
        var param = 'l=' + cloud.getVisibleLayers(true);
        $.ajax({
            url: hostname + '/api/v1/legend/json/' + db + '/?' + param,
            dataType: 'jsonp',
            jsonp: 'jsonp_callback',
            success: function (response) {
                var list = $("<ul/>"), li, classUl, title, className;
                $.each(response, function (i, v) {
                    try {
                        title = metaDataKeys[v.id.split(".")[1]].f_table_title;
                    }
                    catch (e) {
                    }
                    var u, showLayer = false;
                    if (typeof v === "object") {
                        for (u = 0; u < v.classes.length; u = u + 1) {
                            if (v.classes[u].name !== "") {
                                showLayer = true;
                            }
                        }
                        if (showLayer) {
                            li = $("<li/>");
                            classUl = $("<ul/>");
                            for (u = 0; u < v.classes.length; u = u + 1) {
                                if (v.classes[u].name !== "" || v.classes[u].name === "_gc2_wms_legend") {
                                    className = (v.classes[u].name !== "_gc2_wms_legend") ? "<span class='legend-text'>" + v.classes[u].name + "</span>" : "";
                                    classUl.append("<li><img class='legend-img' src='data:image/png;base64, " + v.classes[u].img + "' />" + className + "</li>");
                                }
                            }
                            list.append($("<li>" + title + "</li>"));
                            list.append(li.append(classUl));
                        }
                    }
                });
                $('#legend').html(list);
            }
        });
    };
    cloud = new geocloud.map({
        el: "map",
        zoomControl: false,
        numZoomLevels: 21
    });
    zoomControl = L.control.zoom({
        position: 'topright'
    });
    cloud.map.addControl(zoomControl);

    init = function (me) {
        var metaData, layers = {}, extent = null, i;
        cloud.bingApiKey = window.bingApiKey;
        cloud.digitalGlobeKey = window.digitalGlobeKey;
        for (i = 0; i < window.setBaseLayers.length; i = i + 1) {
            if (typeof window.setBaseLayers[i].restrictTo === "undefined" || window.setBaseLayers[i].restrictTo.indexOf(schema) > -1) {
                cloud.addBaseLayer(window.setBaseLayers[i].id, window.setBaseLayers[i].db);
                $("#base-layer-list").append(
                    "<li><a href=\"javascript:void(0)\" onclick=\"MapCentia.setBaseLayer('" + window.setBaseLayers[i].id + "')\">" + window.setBaseLayers[i].name + "</a></li>"
                );
            }
        }
        // Bind callback
        $("#done-btn").on("click", function () {
            var layersStr, statObj, lStr, statLayers = cloud.getNamesOfVisibleLayers();

            var l = [];
            if (statLayers.length > 0) {
                $.each(statLayers.split(","), function (index, value) {
                    l.push("{\"name\":\"" + value + "\"}");
                });
                lStr = "[" + l.join(",") + "]";
            }

            statObj = {
                layers: lStr,
                bbox: cloud.getExtent().left + "," + cloud.getExtent().bottom + "," + cloud.getExtent().right + "," + cloud.getExtent().top
                //setBaseLayer: cloud.getBaseLayerName()
            };
            callback(statObj);
            window.close();
        });
        $.ajax({
            url: hostname.replace("cdn.", "") + '/api/v1/meta/' + db + '/' + (window.gc2Options.mergeSchemata === null ? "" : window.gc2Options.mergeSchemata.join(",") + ',') + (typeof urlVars.i === "undefined" ? "" : urlVars.i.split("#")[0] + ',') + schema,
            scriptCharset: "utf-8",
            jsonp: 'jsonp_callback',
            success: function (response) {
                var base64name, authIcon, isBaseLayer, arr, groups, i, l, cv;
                groups = [];
                metaData = response;
                for (i = 0; i < metaData.data.length; i++) {
                    metaDataKeys[metaData.data[i].f_table_name] = metaData.data[i];
                    (metaData.data[i].f_table_title) ? metaDataKeysTitle[metaData.data[i].f_table_title] = metaData.data[i] : null;
                }

                for (i = 0; i < response.data.length; ++i) {
                    groups[i] = response.data[i].layergroup;
                }
                arr = array_unique(groups).reverse();
                for (var u = 0; u < response.data.length; ++u) {
                    isBaseLayer = response.data[u].baselayer ? true : false;
                    layers[[response.data[u].f_table_schema + "." + response.data[u].f_table_name]] = cloud.addTileLayers({
                        host: hostname,
                        layers: [response.data[u].f_table_schema + "." + response.data[u].f_table_name],
                        db: db,
                        isBaseLayer: isBaseLayer,
                        tileCached: true,
                        visibility: false,
                        wrapDateLine: false,
                        displayInLayerSwitcher: true,
                        name: response.data[u].f_table_name,
                        type: "tms"
                    });
                }
                for (i = 0; i < arr.length; ++i) {
                    if (arr[i]) {
                        l = [];
                        cv = ( typeof (metaDataKeysTitle[arr[i]]) === "object") ? metaDataKeysTitle[arr[i]].f_table_name : null;
                        base64name = Base64.encode(arr[i]).replace(/=/g, "");
                        $("#layers").append('<div class="panel panel-default" id="layer-panel-' + base64name + '"><div class="panel-heading" role="tab"><h4 class="panel-title"><a class="accordion-toggle" data-toggle="collapse" data-parent="#layers" href="#collapse' + base64name + '"> ' + arr[i] + ' </a></h4></div><ul class="list-group" id="group-' + base64name + '" role="tabpanel"></ul></div>');
                        $("#group-" + base64name).append('<div id="collapse' + base64name + '" class="accordion-body collapse"></div>');
                        response.data.reverse();
                        for (u = 0; u < response.data.length; ++u) {
                            if (response.data[u].layergroup == arr[i]) {
                                var text = (response.data[u].f_table_title === null || response.data[u].f_table_title === "") ? response.data[u].f_table_name : response.data[u].f_table_title;
                                if (response.data[u].baselayer) {
                                    $("#base-layer-list").append(
                                        "<li><a href=\"javascript:void(0)\" onclick=\"MapCentia.setBaseLayer('" + response.data[u].f_table_schema + "." + response.data[u].f_table_name + "')\">" + text + "</a></li>"
                                    );
                                }
                                else {
                                    $("#collapse" + base64name).append('<li class="list-group-item"><span class="checkbox"><label><input type="checkbox" id="' + response.data[u].f_table_name + '" data-gc2-id="' + response.data[u].f_table_schema + "." + response.data[u].f_table_name + '">' + text + '</label></span></li>');
                                    l.push({});
                                }
                            }
                        }
                        // Remove the group if empty
                        if (l.length === 0) {
                            $("#layer-panel-" + base64name).remove();
                        }
                    }
                }
                metaDataReady = true;
                // Bind switch layer event
                $(".checkbox input[type=checkbox]").change(function (e) {
                    switchLayer($(this).data('gc2-id'), $(this).context.checked);
                    e.stopPropagation();
                });
            }
        }); // Ajax call end
        $.ajax({
            url: hostname.replace("cdn.", "") + '/api/v1/setting/' + db,
            dataType: 'jsonp',
            jsonp: 'jsonp_callback',
            success: function (response) {
                if (typeof response.data.extents === "object") {
                    var firstSchema = schema.split(",").length > 1 ? schema.split(",")[0] : schema
                    if (typeof response.data.extents[firstSchema] === "object") {
                        extent = response.data.extents[firstSchema];
                    }
                }
                settingsReady = true;
            }
        }); // Ajax call end

        //Set up the state from the URI
        (function pollForLayers() {
            if (metaDataReady && settingsReady) {
                var layers,layer, coords;
                setBaseLayer(window.setBaseLayers[0].id);
                layers = JSON.parse(obj.layers);
                for (i = 0; i < layers.length; i++) {
                    layer = layers[i].name;
                    switchLayer(layer, true);
                    $("#" + layer.replace(schema + ".", "")).attr('checked', true);
                    $('*[data-gc2-id="' + layer.name + '"]').attr('checked', true);
                }
                if (typeof obj.bbox !== "undefined" && obj.bbox !== "") {
                    coords = obj.bbox.split(",");
                    cloud.map.fitBounds([[coords[1], coords[0]], [coords[3], coords[2]]]);
                } else if (extent !== null) {
                    cloud.zoomToExtent(extent);
                } else {
                    cloud.zoomToExtent();
                }
                addLegend();

            } else {
                setTimeout(pollForLayers, 10);
            }
        }());
    };
    return {
        init: init,
        cloud: cloud,
        setBaseLayer: setBaseLayer,
        schema: schema,
        urlVars: urlVars
    };
}
;