var closer = document.getElementById('popup-closer');
var content = document.getElementById('popup-content');
var coordinate = document.getElementById('popup');
var oPopupContentMsg = document.getElementById('popupContentMsg');
var oLayercontrol = document.getElementById('layercontrol');
var aCbox = oLayercontrol.getElementsByTagName('input');
//var oPopupContentMsgLi = oPopupContentMsg.getElementsByTagName('li');
var oLineEchart = document.getElementById('lineEchart');
//var oEchartBox = document.getElementById('echartBox');
//var oECloser = document.getElementById('echartCloser');
//var oEchart = document.getElementById('echart');
var oFloor = document.getElementById('floor');
var oVillageList = document.getElementById('villageList');
var aPlot = oVillageList.getElementsByTagName('li');
var oSearchChart = document.getElementById('searchChart');
var oTableAQI = document.getElementById('tableAQI');
var oTableColor = oTableAQI.getElementsByTagName('tr');
var highlight, chart, id, bOk;

$.post('file.xml', function(data) {
	var oMsg = data.getElementsByTagName('msg');
	//baidu Map	
	//	var projection = ol.proj.get("EPSG:3857");
	//	var resolutions = [];
	//	for(var i = 0; i < 19; i++) {
	//		resolutions[i] = Math.pow(2, 18 - i);
	//	}
	//	var tilegrid = new ol.tilegrid.TileGrid({
	//		origin: [0, 0],
	//		resolutions: resolutions
	//	});
	//
	//	var baidu_source = new ol.source.TileImage({
	//		projection: projection,
	//		tileGrid: tilegrid,
	//		tileUrlFunction: function(tileCoord, pixelRatio, proj) {
	//			if(!tileCoord) {
	//				return "";
	//			}
	//			var z = tileCoord[0];
	//			var x = tileCoord[1];
	//			var y = tileCoord[2];
	//
	//			if(x < 0) {
	//				x = "M" + (-x);
	//			}
	//			if(y < 0) {
	//				y = "M" + (-y);
	//			}
	//
	//			return "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=" + x + "&y=" + y + "&z=" + z + "&styles=pl&udt=20151021&scaler=1&p=1";
	//		}
	//	});

	// Bing在线地图的url构造函数(获取bing中文地图)
	function tileUrlFunction(coord, params1, params2) {
		return getVETileUrl(coord[0], coord[1], -coord[2] - 1);
	}

	function getVETileUrl(z, x, y) {
		for(var a = "", c = x, d = y, e = 0; e < z; e++) {
			a = ((c & 1) + 2 * (d & 1)).toString() + a;
			c >>= 1;
			d >>= 1
		}
		return 'http://dynamic.t0.tiles.ditu.live.com/comp/ch/' + a + '?it=G,VE,BX,L,LA&mkt=zh-cn,syr&n=z&og=111&ur=CN'
	}

	var layer1 = [
		//	天地图卫星底图
		//		new ol.layer.Tile({
		//			title: "天地图卫星影像",
		//			source: new ol.source.XYZ({
		//				url: 'http://t3.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}'
		//			})
		//		}),
		new ol.layer.Tile({
			source: new ol.source.BingMaps({
				key: 'AkjzA7OhS4MIBjutL21bkAop7dc41HSE0CNTR5c6HJy8JKc7U9U9RveWJrylD3XJ',
				imagerySet: 'Aerial'
			})
		}),
		new ol.layer.Tile({
			source: new ol.source.XYZ({
				wrapX: false,
				tileUrlFunction: tileUrlFunction
			})
		})

	];
	
//	图层管理文件  暂时关掉
	
//	var json1 = {};
//	var json2 = {}
//	for(var i = 0; i < oMsg.length; i++) {
//		var oMsgChild = $(oMsg).eq(i).children(); //获取msg子元素
//		for(var j = 1; j < oMsgChild.length; j++) {
//			var msgName = oMsg[i].childNodes[j].nodeName;
//			json1[msgName] = oMsg[i].childNodes[j].innerHTML;
//			console.log(json1);
//		}
//		json2[i] = json1;
//		json1 = {};
//
//	}
//	for(name in json2) {
//		console.log(json2[name].layer);
//		json2[name] = new ol.layer.Image({
//			source: new ol.source.ImageWMS({
//				ratio: 1,
//				url: 'http://192.168.3.210:8080/geoserver/yizhuang/wms?service=WMS',
//				params: {
//					'LAYERS': json2[name].layer + '',
//				}
//			})
//		});
//		layer1.push(json2[name]);
//	}
	//矢量图层	
	var vectorLayer = new ol.layer.Image({
		source: new ol.source.ImageVector({
			source: new ol.source.Vector({
				url: 'community.geojson',
				format: new ol.format.GeoJSON()
			}),
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(255, 235, 255, 0.6)'
				}),
				stroke: new ol.style.Stroke({
					color: '#000',
					width: 1
				})
			})
		})
	});
	layer1.push(vectorLayer);
	
	toMap(layer1);
});

function toMap(layer1) {
	console.log(layer1[layer1.length - 1])
	// 中心点
	var centerPoint = [116.4, 39.78];
	var controls = new Array();
	//鼠标位置
	var mousePositionControl = new ol.control.MousePosition({
		className: 'custom-mouse-position',
		target: document.getElementById('location'),
		coordinateFormat: ol.coordinate.createStringXY(5), //保留5位小数
		//          ol.coordinate.toStringHDMS(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326')),

		undefinedHTML: '鼠标位置'
	});
	controls.push(mousePositionControl);
	//比例尺
	var scaleLineControl = new ol.control.ScaleLine({
		target: document.getElementById('rotation')
	});
	controls.push(scaleLineControl);

	//  设置图层可见
	
	for(var i = 2; i < aCbox.length; i++) {
		aCbox[i].index = i;

		aCbox[i].onclick = function() {
			//			图层顺序对应按钮顺序  加减input有影响
			layer1[this.index].setVisible(this.checked);
		}
	}
	//	设置天地图不可见
	layer1[0].setVisible(false);
	//	天地图切换
	aCbox[0].onclick = function() {
		layer1[0].setVisible(false);
		layer1[1].setVisible(true)
	}
	aCbox[1].onclick = function() {
		layer1[0].setVisible(true);
		layer1[1].setVisible(false);

	}
	//底图        
	var map = new ol.Map({
		layers: layer1,
		target: 'map',
		controls: ol.control.defaults({
			attributionOptions: ({
				// collapsible: false
			}),
			zoom: false
		}).extend(controls),
		view: new ol.View({
			center: centerPoint,
			projection: 'EPSG:4326',
			zoom: 11,
			maxZoom: 19,
			minZoom: 5
		})

	});

	////	获取当前地图缩放级别
	//	map.getView().on('change:resolution',function(){
	//		 console.log(map.getView().getZoom());
	//	})

	//  鼠标滑过矢量图层样式
	var featureOverlay = new ol.layer.Vector({
		source: new ol.source.Vector(),
		map: map,
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#f60',
				width: 1
			}),
			fill: new ol.style.Fill({
				color: 'rgba(255,0,0,0.1)'
			})
		})
	});
	var displayFeatureInfo = function(pixel) {
		var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
			return feature;
		});

		if(feature !== highlight) {
			if(highlight) {
				featureOverlay.getSource().removeFeature(highlight);
			}
			if(feature) {
				featureOverlay.getSource().addFeature(feature);
			}
			highlight = feature;
		}
	};
	//鼠标滑过变色
	map.on('pointermove', function(evt) {
		if(evt.dragging) {
			return;
		}
		var pixel = map.getEventPixel(evt.originalEvent);
		displayFeatureInfo(pixel);
	});
	//设置弹出框
	var overlay = new ol.Overlay({
		element: coordinate,
		autoPan: true,
		autoPanAnimation: {
			duration: 250 //当Popup超出地图边界时，地图移动的速度
		}
	});
	//	var chart = new ol.Overlay({
	//		//		position: [coordinate[0],coordinate[1]] ,
	//		//		positioning: ol.OverlayPositioning.CENTER_CENTER,  
	//		element: oEchartBox,
	//		autoPan: true,
	//		autoPanAnimation: {
	//			duration: 250 //当Popup超出地图边界时，地图移动的速度
	//		}
	//	});

	//关闭弹出框
	function hideThis() {
		overlay.setPosition(undefined);
		closer.blur();
		return false;
	};

	//	function closeThis() {
	//		chart.setPosition(undefined);
	//		oECloser.blur();
	//		return false;
	//	};
	closer.onclick = hideThis;
	//	oECloser.onclick = closeThis;
	//点击弹出    
	map.on('singleclick', function(evt) {
		if(bOk) { return };

		if(chart) { closeThis(); }
		oPopupContentMsg.innerHTML = '';
		var pixel = map.getEventPixel(evt.originalEvent);
		var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
			//			console.log(feature)
			return feature;
		});
		//		console.log(feature.getId())

		var coordinate = evt.coordinate;
		var hdms = ol.coordinate.toStringHDMS(coordinate);
		if(feature !== undefined) {
			bOk = true;
			
			//			oPopupContentMsg.innerHTML='';
			var id = feature.getId();
			//	获取楼栋信息
			console.log(id)
			$.post('http://localhost:8080/SuJing/monitor_testLouDong.action', { 'feaId': id }, function(data) {
				
				var jsonBAN = JSON.parse(data);
				//				oPopupContentMsg.innerHTML
				if(!oPopupContentMsg.children.length <= 1) {
					for(name in jsonBAN) {
						var aLi = document.createElement('li');
						aLi.innerHTML = name + '&nbsp;:&nbsp;' + jsonBAN[name];
						oPopupContentMsg.appendChild(aLi);
					}
				}
				overlay.setPosition(coordinate);
				map.addOverlay(overlay);
				oFloor.innerHTML = '';
				var floorIndex = jsonBAN.楼层数;
				for(var i = 0; i < floorIndex; i++) {
					var oFloorNum = document.createElement('option');
					oFloorNum.innerHTML = i + 1;
					oFloorNum.value = i;
					oFloor.appendChild(oFloorNum)

				}
				var aFloorNum = oFloor.getElementsByTagName('option');
				//	楼层查询
				oFloor.onchange = function() {
					$.post('http://localhost:8080/SuJing/monitor_testLouCeng.action', { 'feaId': id }, function(data) {
						var arrFloor = eval(data);
						//						console.log(oFloor.value)
						//						console.log(arrFloor[oFloor.value]);
						var jsonFloor = arrFloor[oFloor.value];

						oPopupContentMsg.innerHTML = '';
						for(name in jsonFloor) {
							var aLi = document.createElement('li');
							aLi.innerHTML = name + '&nbsp;:&nbsp;' + jsonFloor[name];
							oPopupContentMsg.appendChild(aLi);
						}
					})
				}

				//				oLineEchart.onclick = function(hdms) {
				//					//					hideThis();
				//					//					oEchart.style.display = 'block';
				//					//					chart.setPosition(coordinate);
				//					//					map.addOverlay(chart);
				//					//	获取楼层信息				
				//					$.post('http://localhost:8080/SuJing/monitor_testLouCeng.action', { 'fid': id }, function(data) {
				//						console.log(id)
				//					})
				//					//					echart()
				//				};
				bOk = false;
			});

		} else {
			hideThis();
		}

	});

	//	function echart() {
	//		var myChart = echarts.init(oEchart);
	//		var dataX = ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"];
	//		var seData = [5, 20, 36, 10, 10, 20];
	//		option = {
	//			backgroundColor: '#fff',
	//		    title: {
	//		        text: 'ECharts示例'
	//		    },
	//			tooltip: {},
	////			legend: { //图例
	////				data: ['销量']
	////			},
	//			xAxis: { //X轴
	//				data: dataX
	//			},
	//			yAxis: {}, //Y轴
	//			series: [{
	//				name: '销量',
	//				type: 'line',
	//				data: seData
	//			}]
	//		};
	//		myChart.setOption(option);
	//	};

	//去成都
	//		aPlot[0].onclick = function fitToChengdu() {
	//			// 让地图最大化完全地显示区域[104, 30.6, 104.12, 30.74]
	//			map.getView().fit([116.42,39.92,116.42,39.93], map.getSize());
	//		}
	//小区查询后台数据

	for(var i = 0; i < aPlot.length; i++) {
		aPlot[i].index = i;
		aPlot[i].onclick = function() {
			$.post('http://localhost:8080/SuJing/monitor_testNeigh.action', { 'name': this.innerHTML }, function(data) {
				var jsonFit = JSON.parse(data);
				var strCenter = jsonFit.中心点坐标.substring(7, jsonFit.中心点坐标.length - 1);
				var arrCenter = strCenter.split(' ');
				map.getView().setCenter(arrCenter);
				console.log(jsonFit.边框)
				var strFit0 = jsonFit.边框.substring(10, jsonFit.边框.length - 2);
				var arrFit0 = strFit0.split(' ');
				var arrFit = [];
				for(var i = 0; i < arrFit0.length; i++) {
					arrFit.push(parseFloat(arrFit0[i]).toFixed(2))
				}
				//				console.log(arrFit);
				map.getView().fit(arrFit, map.getSize());
			})
		}

	}

	//功能
	$('.layercontrol').click(function() {
		$('.funBtn').css('background', 'rgba(222,227,242,0.8)');
		$('.autoDetectContent').hide();
		$('.lays').fadeIn();
		$('.village').hide();
	});
	$('.closeLay').click(function() {
		$('.lays').fadeOut();
		return false;

	});
	//	$('.layercontrol').click(function(){
	//		$('.lays').toggle();
	//  });
	$('.findvill').click(function() {
		$('.funBtn').css('background', 'rgba(222,227,242,0.8)');
		$('.village').toggle();
		$('.autoDetectContent').hide();
		$('.lays').hide();

	});
	$('.autoDetect').on('click', function() {
		$('.village').hide();
		$('.autoDetectContent').hide();
		$('.funBtn').css('background', 'rgba(222,227,242,1)');
		$('.autoDetectContent').toggle();
	})
	//	常规因子图
	$('#submit').click(function(){
		var arrRnd = []
		for(var i = 0; i < 13; i++) {
			var num = Math.floor(Math.random() * 100);
			arrRnd.push(num)
		}
		chart2(arrRnd)
	})

	function chart2(seData) {
		var myChart2 = echarts.init(oSearchChart);
		//		var dataX = ;
		//		var seData = [5, 20, 36, 10, 10, 20];
		
		var option2 = {
			title: {
				text: '常规因子',
				left:15
			},
//			grid:{
//				show:true
//			},
			tooltip: {},
			legend: { //图例
				data: ['销量']
			},
			xAxis: { //X轴
				spiltLine:[{
					show:true,
					interval :0
				}],
				data: ["0:00", "2:00", "4:00", "6:00", "8:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"],
				
			},
			yAxis: {
				spiltLine:[{
					show:true
				}],
//				data:["0","20","40","60","80","100"]
			}, //Y轴
			series: [{
				//				name: '销量',
				type: 'line',
				data: seData
			}]
		};
		myChart2.setOption(option2);
	}

	chart2();
	
//	站点查询图

$('#siteQuerySubmit').click(function(){
		var arrRnd = []
		for(var i = 0; i < 8; i++) {
			var num = Math.floor(Math.random() * 100);
			arrRnd.push(num)
		}
		chart3(arrRnd)
	})
function chart3(seData) {
		var myChart3 = echarts.init(document.getElementById('siteQueryChart'));
		//		var dataX = ;
		//		var seData = [5, 20, 36, 10, 10, 20];
		
		var option3 = {
			title: {
				text: '站点查询',
				left:15
			},
//			grid:{
//				show:true
//			},
			tooltip: {},
//			legend: { //图例
//				data: ['销量']
//			},
			xAxis: { //X轴
//				spiltLine:[{
//					show:true,
//					interval :3
//				}],
				data: ["站点一","站点二","站点三","站点四","站点五","站点六","站点七","站点八"],
				
			},
			yAxis: {
//				spiltLine:[{
//					show:true
//				}],
//				data:["0","20","40","60","80","100"]
			}, //Y轴
			series: [{
				//name: '销量',
				type: 'bar',
				data: seData
			}]
		};
		myChart3.setOption(option3);
	}
	chart3()
	
//	超标情况查询

	//	站点查询图

$('#excessiveSubmit').click(function(){
		var arrRnd = []
		for(var i = 0; i < 13; i++) {
			var num = Math.floor(Math.random() * 100);
			arrRnd.push(num)
		}
		chart4(arrRnd)
	})
function chart4(seData) {
		var myChart4 = echarts.init(document.getElementById('excessiveChart'));
		//		var dataX = ;
		//		var seData = [5, 20, 36, 10, 10, 20];
		
		var option4 = {
			title: {
				text: '站点查询',
				left:15
			},
			grid:{
				show:false
			},
			tooltip: {},
//			legend: { //图例
//				data: ['销量']
//			},
			xAxis: { //X轴
				spiltLine:[{
					show:false,
					interval :1
				}],
				data: ["0:00", "2:00", "4:00", "6:00", "8:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"],
				
			},
			yAxis: {}, //Y轴
			series: [{
				//name: '销量',
				type: 'scatter',
				data: seData
			}]
		};
		myChart4.setOption(option4);
	}
	chart4()
	
	for(var i = 0; i < oTableColor.length; i++) {
		if(i % 2) {
			oTableColor[i].style.background = '#f7f7f7';

		} else {
			oTableColor[i].style.background = '#fff';
		}
	}
}