var mapcentia_lokalplaner;
mapcentia_lokalplaner = (function () {
    "use strict";
    var rules = {
            rules: [
                new OpenLayers.Rule({
                    filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "planstatus",
                        value: 'Vedtaget'
                    }),
                    symbolizer: {
                        fillColor: "#0000FF",
                        fillOpacity: 0.5,
                        strokeColor: "#fff"
                    }
                }),
                new OpenLayers.Rule({
                    filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "planstatus",
                        value: 'Forslag'
                    }),
                    symbolizer: {
                        fillColor: "#FF0000",
                        fillOpacity: 0.5,
                        strokeColor: "#fff"
                    }
                })
            ]
        },
        styleMap = new OpenLayers.StyleMap(
            {
                "default": new OpenLayers.Style(
                    {
                        strokeWidth: 1,
                        graphicZIndex: 1
                    },
                    rules
                ),
                "select": new OpenLayers.Style(
                    {
                        fillOpacity: 0.8,
                        graphicZIndex: 2
                    }
                )
            }
        ),
        selectControl = {
            onSelect: function (feature) {
                $("#start").show();
                var irowid = feature.attributes.irowid;
            },
            onUnselect: function () {
                $("#start").hide();
            }
        },
        loadMessage = Ext.MessageBox,
        init = function (conf) {
            var grid, columns = conf.cm, cloud = new mygeocloud_ol.map("map", "dk"), store;
            loadMessage.show({ msg: 'Henter lokalplaner...',
                progressText: 'Henter...', width: 300, wait: true, waitConfig: {interval: 200} });
            store = new mygeocloud_ol.geoJsonStore("dk", {styleMap: styleMap});
            try {
                cloud.addOSM();
            } catch (e) {

            }

            cloud.addGeoJsonStore(store);
            store.sql = "select planid,komnr,objektkode,plantype,plannr,plannavn,anvendelsegenerel as anvgen,anvspec,datoforsl,(case when planstatus = 'V' then 'Vedtaget' else 'Forslag' END) as planstatus,zonestatus,the_geom from planer.lokalplan_vedtaget where komnr=" + conf.komnr +
                " union select planid,komnr,objektkode,plantype,plannr,plannavn,anvendelsegenerel as anvgen,anvspec,datoforsl,(case when planstatus = 'V' then 'Vedtaget' else 'Forslag' END) as planstatus, zonestatus, the_geom from planer.lokalplan_forslag where komnr=" + conf.komnr + " order by planid desc";
            store.load();
            store.onLoad = function () {
                cloud.zoomToExtentOfgeoJsonStore(store);
                grid = new mygeocloud_ol.grid("grid", store, {
                    columns: columns,
                    selectControl: selectControl,
                    listeners: {
                        rowdblclick: function () {
                        }
                    }
                });
                loadMessage.hide();
                $("#zoom").on("click",
                    function () {
                        grid.grid.getSelectionModel().each(function (rec) {
                                var feature = rec.get('feature');
                                cloud.map.zoomToExtent(feature.geometry.getBounds());
                            }
                        );
                    }
                );
                $("#look").on("click",
                    function () {
                        var feature;
                        grid.grid.getSelectionModel().each(function (rec) {
                            feature = rec.get('feature');
                        });
                        var link = "http://mygeocloud.cowi.webhouse.dk/apps/custom/planurl/public/index.php/api/v1/url/" + conf.db + "/" + conf.table + "/" + feature.attributes.planid;
                        var record = grid.grid.getSelectionModel().getSelected();
                        window.open(link);
                    }
                );
            };
            var addAttribution = function () {
                for (var i = 0; i < cloud.map.layers.length; i++) {
                    if (cloud.map.layers[i].isBaseLayer === true) {
                        //cloud.map.layers[i].attribution = "Copyright KMS, COWI, Odder Kommune - kort og data er kun vejledende";
                    }
                }
            };
            addAttribution();
            cloud.map.addControl(new OpenLayers.Control.Attribution());
        };
    return {
        init: init
    };
})();

