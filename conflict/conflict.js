var init_search = function(db, komKode, bbox){
	var cloudMap = new mygeocloud_ol.map("map",db);
	//cloudMap.zoomToExtent();
	//cloudMap.addOSM();
	//cloudMap.setBaseLayer("osm");
	var style = {
		"color": "#ff0000",
		"weight": 5,
		"opacity": 0.65
	};
	var layerObj={};
	layerObj.name = {};
	layerObj.url = {};		
	var callback = function (obj){
		for (var i=0; i<obj.data.length; i++){
			layerObj.name[obj.data[i].f_table_name] = obj.data[i].f_table_title;
			layerObj.url[obj.data[i].f_table_name] = obj.data[i].meta_url;
		}
		//console.log(layerObj);
	};
	document.write('<script src="http://beta.mygeocloud.cowi.webhouse.dk/controller/tables/' + db + '/getallrecords/settings.geometry_columns_view?jsonp_callback=cowi.callback"><\/script>');
	var switchLayer = function(id, visible) {
		(visible) ? cloudMap.map.getLayersByName(id)[0].setVisibility(true) : cloudMap.map.getLayersByName(id)[0].setVisibility(false);
		addLegend();
	};		
	var addLegend = function() {
		var hostname = "http://alpha.mygeocloud.cowi.webhouse.dk";
		var layers = cloudMap.getVisibleLayers();
		var param = 'layers=' + layers + '&type=text&lan=';
		$.ajax({
			url : hostname + '/apps/viewer/servers/legend/' + db + '?' + param,
			dataType : 'jsonp',
			jsonp : 'jsonp_callback',
			success : function(response) {
				$('#legendContent').html(response.html);

			}
		});
	};		

	(function(){
		var store;
		var call_counter = 0;
		var names = [];
		var map = {};
		var type = "";
		var search = _.debounce(function (query, process) {
			type = (query.match(/\d+/g) != null) ? "adresser" : "vejnavne";
			map = {};
			//console.log(type);
			switch (type) {
				case 'vejnavne':
					$.ajax({
						url: 'http://geo.oiorest.dk/vejnavne.json?',
						data: 'maxantal=4&vejnavn=' + $.trim(query.toLowerCase())+ '*&kommunekode=' + komKode,
						dataType: 'jsonp',
						jsonp: 'callback',
						success: function (response) {
							$.each(response, function (i, hit) {
								console.log(response);
								var str = hit.navn;
								names.push(str);
							});
							process(names);
							names = [];
						}
					});
					break;
				case 'adresser':
					$.ajax({
						url: 'http://geo.oiorest.dk/adresser.json?',
						data: 'maxantal=4&vejnavn=' + $.trim(query.match(/\D+/)) + '&husnr=' + $.trim(query.match(/\d+(\D+)?/g)) + '*&kommunekode=' + komKode,
						dataType: 'jsonp',
						jsonp: 'callback',
						success: function (response) {
							$.each(response, function (i, hit) {
								console.log(response);
								var str = hit.vejnavn.navn + ' ' + hit.husnr + ' (' + hit.postnummer.nr + ')' ;
									map[str] = hit.etrs89koordinat;
									names.push(str);
									});
								process(names);
								names = [];
								}
								});
							break;
							}
							},200)
					$('#a_search').typeahead({
						source: function ( query, process ) {
							search( query, process );
						},
					updater: function (item) {
						console.log(map)
						var selected = (type==="adresser") ? map[item] : null;
					if (selected) {
						showOnMap(selected);
					}
					return item;
					},
					matcher: function (item) {
						var arr = this.query.split(' ');
						var flag = false
						_(arr).each(
							function(s){
								//console.log(item)
								if (item.toLowerCase().indexOf($.trim(s).toLowerCase()) ===false) {
									flag = false;
								}
								else flag = true;
							}
							) 
						return flag;
					},
					sorter: function (items) {
						return items.sort();
					},
					highlighter: function (item) {
						_($.trim(this.query).split(' ')).each(
								function(s){
									var regex = new RegExp( '(' + s + ')', 'gi' );
									item = item.replace( regex, "<b>$1</b>" );
								}
								)
							return item;
					},
					items: 10
					});
					var showOnMap = function(obj) {
						var p = transformPoint(obj.oest, obj.nord, "EPSG:25832", "EPSG:900913") 
							cloudMap.map.setCenter(new OpenLayers.LonLat(p.x, p.y), 17);
						var wkt = "POINT(" + obj.oest + " " + obj.nord + ")";
						conflict(wkt)

					}
					transformPoint = function (lat, lon, s, d) {
						var source = new Proj4js.Proj(s);    //source coordinates will be in Longitude/Latitude
						var dest = new Proj4js.Proj(d);
						var p = new Proj4js.Point(lat, lon);
						Proj4js.transform(source, dest, p);
						return p;
					};
	})();

	(function(){
		var store;
		var call_counter = 0;
		var names = [];
		var map = {};
		var type = "";
		var search = _.debounce(function (query, process) {
			type = (query.match(/\d+/g) != null) ? "jordstykke" : "ejerlav";
			map = {};
			$.ajax({
				url: 'http://eu1.mapcentia.com/api/v1/elasticsearch/search/dk/dk/' + type,
				data: 'call_counter=' + (++call_counter) + '&q={"query":{"query_string":{"default_field":"string","query":"' + encodeURIComponent(query.toLowerCase())+ '","default_operator":"AND"}}}',
				dataType: 'jsonp',
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
		},0)
		$('#m_search').typeahead({
			source: function ( query, process ) {
				search( query, process );
			},
			updater: function (item) {
				var selectedGid = (type==="jordstykke") ? map[item] : null;
				if (selectedGid) {
					showOnMap(selectedGid);
				}
				return item;
			},
			matcher: function (item) {
				var arr = this.query.split(' ');
				var flag = false
			_(arr).each(
				function(s){
					//console.log(item)
					if (item.toLowerCase().indexOf($.trim(s).toLowerCase()) ===false) {
						flag = false;
					}
					else flag = true;
				}
				) 
			return flag;

			},
			sorter: function (items) {
				return items.sort();
			},
			highlighter: function (item) {
				_($.trim(this.query).split(' ')).each(
						function(s){
							var regex = new RegExp( '(' + s + ')', 'gi' );
							item = item.replace( regex, "<b>$1</b>" );
						}
						)
					return item;
			},
			items: 10
		});
		var showOnMap = function(gid) {
			store.reset();
			store.sql = "SELECT gid,the_geom,ST_astext(the_geom) as wkt FROM matrikel.jordstykke WHERE gid=" + gid;
			store.load();
		}
		store = new geocloud.geoJsonStore({
			db: "dk",
		      sql: null,
		      onLoad : function(){
			      cloudMap.zoomToExtentOfgeoJsonStore(store);
			      conflict(store.geoJSON.features[0].properties.wkt);
		      }
		});
		//	cloudMap.addGeoJsonStore(store);
	})();
	var  conflict = function(wkt) {
		$("#result-table").empty();
		var arr = ["kpplandk2_view","_1_1_byudvikling","_1_3_erhverv"];
		var store = [];
		for (var i=0; i<arr.length; i++){
			store[i] = new mygeocloud_ol.geoJsonStore(db);
			store[i].sql = "SELECT * FROM kommuneplan." + arr[i] + " WHERE ST_intersects(the_geom,ST_SetSRID(ST_geomfromtext('" + wkt + "'),25832))"
				store[i].id = arr[i];
			store[i].load();
			store[i].onLoad = function(){
				if (this.geoJSON.features !== undefined){
					cloudMap.addTileLayers(["kommuneplan." + this.id], {
						name: "kommuneplan." + this.id,
						visibility : false
					});
					$('#result-table').append("<tr><td><input type='checkbox' onclick='cowi.switchLayer(\"kommuneplan." + this.id + "\",this.checked)'></td><td>" + layerObj.name[this.id] + "</td></tr>");
					if (this.id==="kpplandk2_view") {
						$.each(this.geoJSON.features,
								function(key, value) {
									console.log(value);
									$('#result-table').append("<tr><td></td><td>" + value.properties.plannr + "</td></tr>");
								})
					}
				}
			}
		}
		store = null;
	}	
	return {
		callback: callback,
		switchLayer: switchLayer
	}
};
