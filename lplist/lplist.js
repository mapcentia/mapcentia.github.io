var cowi_lp = (function(){
	var columns = [
{
	"header":"Plannr",
    "dataIndex":"plannr",
    "type":"varchar",
    "typeObj":null
},{
	"header":"Plannavn",
    "dataIndex":"plannavn",
    "type":"varchar",
    "typeObj":null
},{
	"header":"Anvendelse",
    "dataIndex":"anvgen",
    "type":"varchar",
    "typeObj":null
},{
	"header":"Zonestatus",
    "dataIndex":"zonestatus",
    "type":"varchar",
    "typeObj":null
}
,{
	"header":"Planstatus",
	"dataIndex":"planstatus",
	"type":"varchar",
	"typeObj":null
}
];
var styleMap = new OpenLayers.StyleMap({
	"default": new OpenLayers.Style({
		fillColor: "#ffffff",
		fillOpacity: 0.0,
		strokeColor: "#0000aa",
		strokeWidth: 2,
		graphicZIndex: 3
	}
	),
		"select": new OpenLayers.Style({
			fillColor: "#0000ff",
		fillOpacity: 0.3,
		strokeColor: "#0000aa",
		graphicZIndex: 2
		}
		)
});
var selectControl = {
	onSelect: function (feature) {
		$("#start").show();
		irowid = feature.attributes.irowid;
	},
	onUnselect: function() {
		$("#start").hide();
	}
}
var loadMessage = Ext.MessageBox;
var init_list = function(conf) {
	var grid, cloud = new mygeocloud_ol.map("map","dk");
	loadMessage.show({ msg: 'Henter lokalplaner...',
		progressText: 'Henter...', width:300, wait:true, waitConfig:
	{interval:200} });
	var store = new mygeocloud_ol.geoJsonStore("dk",{styleMap: styleMap});
	//var b = cloud.addTileLayers(["public.kms"],{isBaseLayer:true});
	//cloud.map.setBaseLayer(b[0]);
	cloud.addGeoJsonStore(store);
	//store.selectFeatureControl.activate();
	var doklink = "'http://beta.mygeocloud.cowi.webhouse.dk/apps/custom/lokalplanliste/redirect.php\?komnr='||komnr||'%26plannr='||plannr||'%26planid='||planid||'%26host=" + conf.host + "%26folder=" + conf.folder + "%26db=" + conf.db + "%26table=" + conf.table + "%26doklink='||doklink as doklink";
	store.sql = "select planid,komnr,objektkode,plantype,plannr,plannavn,anvendelsegenerel as anvgen,anvspec,datoforsl," + doklink + ",planstatus,zonestatus,the_geom from planer.lokalplan_vedtaget where komnr=" + conf.komnr + " union select planid,komnr,objektkode,plantype,plannr,plannavn,anvendelsegenerel as anvgen,anvspec,datoforsl," + doklink + ",planstatus,zonestatus,the_geom from planer.lokalplan_forslag where komnr=" + conf.komnr + " order by planid desc";
	store.load();
	store.onLoad = function(){
		cloud.zoomToExtentOfgeoJsonStore(store);
		grid = new mygeocloud_ol.grid("grid",store,{
			columns: columns,
		     selectControl: selectControl,
		     listeners:{
			     rowdblclick: function()
		{
		}  
		     }
		});
		loadMessage.hide();
		$("#zoom").on("click", function(){
			grid.grid.getSelectionModel().each(function(rec){var feature = rec.get('feature');cloud.map.zoomToExtent(feature.geometry.getBounds());});
		}
		)
			$("#look").on("click", function(){
				var link = "http://mygeocloud.cowi.webhouse.dk/apps/custom/planurl/public/index.php/api/v1/url/" + conf.db + "/lokalplaner.lpplandk2_view/" + record.get('planid');
				var record=grid.grid.getSelectionModel().getSelected();window.open(link);
			}
			)
	};
	addAttribution = function (){
		for (var i = 0; i < cloud.map.layers.length; i++) {
			if(cloud.map.layers[i].isBaseLayer===true)
			{
				//cloud.map.layers[i].attribution = "Copyright KMS, COWI, Odder Kommune - kort og data er kun vejledende";
			}
		}
	}
	addAttribution();
	cloud.map.addControl(new OpenLayers.Control.Attribution());
}
return {
	init_list: init_list
}
})();

