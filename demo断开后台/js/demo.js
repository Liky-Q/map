var closer = document.getElementById('popup-closer');
var content = document.getElementById('popup-content');
var coordinate = document.getElementById('popup');
var oPopupContentMsg = document.getElementById('popupContentMsg');
var oLayercontrol = document.getElementById('layercontrol');
var aCbox = oLayercontrol.getElementsByTagName('input');
var oLineEchart = document.getElementById('lineEchart');
var oFloor = document.getElementById('floor');
var oVillageList = document.getElementById('villageList');
var aPlot = oVillageList.getElementsByTagName('li');
var oSearchChart = document.getElementById('searchChart');
var oTableAQI = document.getElementById('tableAQI');
var oTableColor = oTableAQI.getElementsByTagName('tr');
var oSuspend = document.getElementById('suspend')
var highlight, chart, id, bOk;

function rnd(n, m) {
	return parseInt(Math.random() * (m - n) + n);
}

$.post('file.xml', function(data) {
	var oMsg = data.getElementsByTagName('msg');
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

	//	图层管理文件  
	var json1 = {};
	var json2 = {}
	for(var i = 0; i < oMsg.length; i++) {
		var oMsgChild = $(oMsg).eq(i).children(); //获取msg子元素
		for(var j = 1; j < oMsgChild.length; j++) {
			var msgName = oMsg[i].childNodes[j].nodeName;
			json1[msgName] = oMsg[i].childNodes[j].innerHTML;
			console.log(json1);
		}
		json2[i] = json1;
		json1 = {};
	}
	for(name in json2) {
		console.log(json2[name].layer);
		json2[name] = new ol.layer.Image({
			source: new ol.source.ImageWMS({
				ratio: 1,
				url: 'http://192.168.3.210:8080/geoserver/yizhuang/wms?service=WMS',
				params: {
					'LAYERS': json2[name].layer + '',
				}
			})
		});
		layer1.push(json2[name]);
	}

	//矢量图层	
	var source = new ol.source.Vector({
		url: 'community.geojson',
		format: new ol.format.GeoJSON()
	})
	var vectorLayer = new ol.layer.Vector({
		source: source,
		style: styleFunction
	});

	layer1.push(vectorLayer);
	var vectorLayer2 = new ol.layer.Vector({
		source: new ol.source.Vector({
			url: 'point.geojson',
			format: new ol.format.GeoJSON()
		}),
		style: styleFunction1
	});

	function styleFunction1(feature, resolution) {
		return new ol.style.Style({
			image: new ol.style.Icon({
				src: 'images/jiance.png',
				scale: 0.7
			})
		})
	}
	layer1.push(vectorLayer2);
	toMap(layer1);
	var jsonColor = {
		"zero": "#FFFFFF",
		"one": "#0080FF",
		"two": "#80FFFF",
		"three": "#00FF80",
		"four": "#80FF80",
		"five": "#FFFF80",
		"six": "#DBDB0D",
		"seven": "#FF8000",
		"eight": "#FF0000",
		"nine": "#CE2906",
	}

	function styleFunction(feature, resolution) {
		var number = feature.get('number') + ''
		var level = feature.get('incomeLevel');
		if(!level) {
			level = 'rgba(130,202,232,0.6)';
		}
		var style = new ol.style.Style({
			fill: new ol.style.Fill({
				color: level
			}),
			stroke: new ol.style.Stroke({
				color: '#000',
				width: 1
			}),
			text: new ol.style.Text({
				font: '12px Calibri,sans-serif',
				text: number,
				fill: new ol.style.Fill({
					color: '#fff'
				}),
				stroke: new ol.style.Stroke({
					color: '#ccc',
					width: 1
				})
			})

		});
		return style
	}

	$('#renderingList li').eq(0).on('click', function(event) {
		if(source.getState() == 'ready') {
			//        source.unByKey(key);
			vectorLayer.getSource().forEachFeature(function(feature) {
				var code = feature.get('TSP');

				function TSP(code) {
					if(code < 5) {
						return jsonColor.zero;
					} else if(code <= 10) {
						return jsonColor.one;
					} else if(code <= 15) {
						return jsonColor.two;
					} else if(code <= 20) {
						return jsonColor.three;
					} else if(code <= 25) {
						return jsonColor.four;
					} else if(code <= 30) {
						return jsonColor.five;
					} else if(code <= 35) {
						return jsonColor.six;
					} else if(code <= 40) {
						return jsonColor.seven;
					} else if(code <= 45) {
						return jsonColor.eight;
					} else if(code > 45) {
						return jsonColor.nine;
					}
				}
				if(code) {
					feature.set('incomeLevel', TSP(code));
				}
			});
		}
	});
	$('#renderingList li').eq(1).on('click', function(event) {

		if(source.getState() == 'ready') {
			vectorLayer.getSource().forEachFeature(function(feature) {
				var code = feature.get('PM2_5');

				function pm2_5(code) {
					if(code < 1) {
						return jsonColor.zero;
					} else if(code <= 3) {
						return jsonColor.one;
					} else if(code <= 5) {
						return jsonColor.two;
					} else if(code <= 7) {
						return jsonColor.three;
					} else if(code <= 9) {
						return jsonColor.four;
					} else if(code <= 11) {
						return jsonColor.five;
					} else if(code <= 13) {
						return jsonColor.six;
					} else if(code <= 15) {
						return jsonColor.seven;
					} else if(code <= 17) {
						return jsonColor.eight;
					} else if(code > 17) {
						return jsonColor.nine;
					}
				}
				if(code) {
					feature.set('incomeLevel', pm2_5(code));
				}
			});
		}
	});
	$('#renderingList li').eq(2).on('click', function(event) {
		if(source.getState() == 'ready') {
			vectorLayer.getSource().forEachFeature(function(feature) {
				var code = feature.get('PM10');

				function PM10(code) {
					if(code < 3) {
						return jsonColor.zero;
					} else if(code <= 6) {
						return jsonColor.one;
					} else if(code <= 9) {
						return jsonColor.two;
					} else if(code <= 12) {
						return jsonColor.three;
					} else if(code <= 15) {
						return jsonColor.four;
					} else if(code <= 18) {
						return jsonColor.five;
					} else if(code <= 21) {
						return jsonColor.six;
					} else if(code <= 24) {
						return jsonColor.seven;
					} else if(code <= 27) {
						return jsonColor.eight;
					} else if(code > 27) {
						return jsonColor.nine;
					}
				}
				if(code) {
					feature.set('incomeLevel', PM10(code));
				}
			});
		}
	});
	$('#renderingList li').eq(3).on('click', function(event) {
		if(source.getState() == 'ready') {
			vectorLayer.getSource().forEachFeature(function(feature) {
				var code = feature.get('noise');

				function noise(code) {
					if(code < 35) {
						return jsonColor.zero;
					} else if(code <= 40) {
						return jsonColor.one;
					} else if(code <= 45) {
						return jsonColor.two;
					} else if(code <= 50) {
						return jsonColor.three;
					} else if(code <= 55) {
						return jsonColor.four;
					} else if(code <= 60) {
						return jsonColor.five;
					} else if(code <= 65) {
						return jsonColor.six;
					} else if(code <= 70) {
						return jsonColor.seven;
					} else if(code <= 75) {
						return jsonColor.eight;
					} else if(code > 75) {
						return jsonColor.nine;
					}
				}
				if(code) {
					feature.set('incomeLevel', noise(code));
				}
			});
		}
	});
});

function toMap(layer1) {
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

	//  鼠标滑过矢量图层样式
	var featureOverlay = new ol.layer.Vector({
		source: new ol.source.Vector(),
		map: map,
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#2fbaf5',
				width: 1
			}),
			fill: new ol.style.Fill({
				color: 'rgba(98,204,249,0.5)'
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

	//获取所有feature
	var vectorLayer2 = layer1[layer1.length - 1];
	var listenerKey = vectorLayer2.getSource().on('change', function() {

		if(vectorLayer2.getSource().getState() === 'ready') { // 判定是否加载完成
			//			map.getView().on('change:resolution',function(){
			var features2 = vectorLayer2.getSource().getFeatures();
			for(var i = 0; i < features2.length; i++) {
				var oDiv = document.createElement('div');
				oDiv.innerHTML = parseInt(Math.random() * 100);
				oDiv.className = 'suspendover'
				var suspend = new ol.Overlay({
					id: 'suspend',
					element: oDiv,
					autoPan: true,
					position: features2[i].getGeometry().B,
					positioning: 'center-center',
				});
				map.addOverlay(suspend);
			}
			//			})

		}
		var aSuspendover = document.getElementsByClassName('suspendover');
		setInterval(function() {
			for(var i = 0; i < aSuspendover.length; i++) {
				var n = parseInt(Math.random() * 100);
				aSuspendover[i].innerHTML = n;
			}
		}, 1000)
		//      vectorLayer2.getSource().unByKey(listenerKey); // 注销监听器
	});

	//关闭弹出框
	function hideThis() {
		overlay.setPosition(undefined);
		closer.blur();
		return false;
	};
	closer.onclick = hideThis;

	//点击弹出   
	map.on('singleclick', function(evt) {
		if(bOk) {
			return
		};

		if(chart) {
			closeThis();
		}
		oPopupContentMsg.innerHTML = '';
		var pixel = map.getEventPixel(evt.originalEvent);
		var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
			if(layer == layer1[layer1.length - 2]) return feature; //图层过滤器
		});
		var coordinate = evt.coordinate;
		var hdms = ol.coordinate.toStringHDMS(coordinate);
		if(feature !== undefined) {
			bOk = true;
			//	获取楼栋信息  
			$.post('community.geojson', function(data) {
				var id = feature.getId();
				var jsonBAN = JSON.parse(data);
				var features = jsonBAN.features
				var data = new Date();
				var month = Number(data.getMonth()) + 1
				for(var i = 0; i < features.length; i++) {
					if(id == features[i].id) {
						oPopupContentMsg.innerHTML = '<li class="popList">楼号: ' + features[i].properties.number + '</li>' +
							'<li class="popList">楼层数: ' + features[i].properties.floor2 + '</li>' +
							'<li class="popList">时间: ' + data.getFullYear() + '-' + month + '-' + data.getDate() + '</li>' +
							'<li class="popList">噪声: ' + features[i].properties.noise + '</li>' +
							'<li class="popList">PM2.5: ' + features[i].properties.PM2_5 + '</li>' +
							'<li class="popList">PM10: ' + features[i].properties.PM10 + '</li>' +
							'<li class="popList">TSP: ' + features[i].properties.TSP + '</li>';
						overlay.setPosition(coordinate);
						map.addOverlay(overlay);
						oFloor.innerHTML = '';
						var floorIndex = features[i].properties.floor2;
						var oFloorSelect = document.createElement('option');
						oFloorSelect.innerHTML = '选择楼层';
						oFloorSelect.disabled = 'disabled';
						oFloorSelect.selected = 'selected';
						oFloor.appendChild(oFloorSelect);
						for(var j = 0; j < floorIndex; j++) {
							var oFloorNum = document.createElement('option');
							oFloorNum.innerHTML = j + 1;
							oFloorNum.value = j;
							oFloor.appendChild(oFloorNum)
						}
					}
				}
				var aFloorNum = oFloor.getElementsByTagName('option');

				//	楼层查询  
				oFloor.onchange = function() {
					oPopupContentMsg.innerHTML = '';
					oPopupContentMsg.innerHTML = '<li class="popList">噪声: ' + rnd(35, 85) + '</li>' +
						'<li class="popList">PM2.5: ' + rnd(3, 18) + '</li>' +
						'<li class="popList">PM10: ' + rnd(7, 30) + '</li>' +
						'<li class="popList">TSP: ' + rnd(10, 45) + '</li>';
					$.post('http://localhost:8080/SuJing/monitor_testLouCeng.action', {
						'feaId': id
					}, function(data) {
						var arrFloor = eval(data);
						//						console.log(oFloor.value)
						//						console.log(arrFloor[oFloor.value]);
						var jsonFloor = arrFloor[oFloor.value];

						oPopupContentMsg.innerHTML = '';
						for(name in jsonFloor) {
							var aLi = document.createElement('li');
							aLi.className = 'popList';
							aLi.innerHTML = name + '&nbsp;:&nbsp;' + jsonFloor[name];
							oPopupContentMsg.appendChild(aLi);
						}
					})
				}
				bOk = false;
			});
		} else {
			hideThis();
		}
	});
	//小区查询后台数据
	var arrPlot = [
		[116.35, 39.92, 116.37, 39.94],
		[116.41, 39.92, 116.43, 39.93],
		[116.36, 39.87, 116.38, 39.88],
		[116.42, 39.87, 116.44, 39.89]
	];
	for(var i = 0; i < aPlot.length; i++) {
		aPlot[i].index = i;
		aPlot[i].onclick = function() {
			var plot = arrPlot[this.index];
			map.getView().fit(plot, map.getSize());
		}
	}
	//功能
	//	图层管理
	$('.layercontrol').click(function() {
		$('.funBtn').css('background', 'rgba(222,227,242,0.8)');
		$('.autoDetectContent').hide();
		$('.lays').fadeIn();
		$('.village').hide();
		$('.rendering').hide();
	});
	$('.closeLay').click(function() {
		$('.lays').fadeOut();
		return false;

	});
	$('.findvill').click(function() {
		$('.funBtn').css('background', 'rgba(222,227,242,0.8)');
		$('.village').toggle();
		$('.autoDetectContent').hide();
		$('.lays').hide();
		$('.rendering').hide();
	});
	$('.renderingBtn').click(function() {
		$('.funBtn').css('background', 'rgba(222,227,242,0.8)');
		$('.rendering').toggle();
		$('.autoDetectContent').hide();
		$('.village').hide();
		$('.lays').hide();

	});
	$('.autoDetect').on('click', function() {
		//		$('.village').hide();
		$('.autoDetectContent').hide();
		$('.rendering').hide();
		$('.funBtn').css('background', 'rgba(222,227,242,1)');
		$('.autoDetectContent').show().click(function(event) {
			event.stopPropagation();
			//	一样效果				return false;
		});
	})
	//时间插件	
	$("#datepicker1").datepicker({
		dateFormat: "yy-mm-dd"
	});
	$("#datepicker2").datepicker({
		dateFormat: "yy-mm-dd"
	});
	$("#datepicker3").datepicker({
		dateFormat: "yy-mm-dd"
	});
	$("#datepicker4").datepicker({
		dateFormat: "yy-mm-dd"
	});
	$("#datepicker5").datepicker({
		dateFormat: "yy-mm-dd"
	});
	$("#datepicker6").datepicker({
		dateFormat: "yy-mm-dd"
	});

	//	常规因子图
	$('#submit').click(function() {
		var arrRnd = []
		for(var i = 0; i < 13; i++) {
			var num = rnd(0, 100);
			arrRnd.push(num)
		}
		chart2(arrRnd)
	})
	function chart2(seData) {
		var myChart2 = echarts.init(oSearchChart);
		var option2 = {

			title: {
				text: '常规因子',
				left: 15,
				textStyle: {
					color: '#82cae8',
					fontWeight: '400',
				}
			},
			tooltip: {},
			legend: { //图例
				data: ['销量']
			},
			xAxis: { //X轴
				spiltLine: [{
					show: true,
					interval: 0
				}],
				data: ["0:00", "2:00", "4:00", "6:00", "8:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"],
			},
			yAxis: {
				spiltLine: [{
					show: true
				}],
			}, //Y轴
			series: {
				//				name: '销量',
				type: 'line',
				data: seData,
				itemStyle: {
					normal: {
						color: '#8ad6f6'
					}
				}
			}
		};
		myChart2.setOption(option2);
	}
	chart2([]);

	//	站点查询图
	$('#siteQuerySubmit').click(function() {
		var arrRnd = []
		for(var i = 0; i < 8; i++) {
			var num = rnd(0, 100);
			arrRnd.push(num)
		}
		chart3(arrRnd)
	})

	function chart3(seData) {
		var myChart3 = echarts.init(document.getElementById('siteQueryChart'));
		var option3 = {
			title: {
				text: '站点查询',
				left: 15,
				textStyle: {
					color: '#82cae8',
					fontWeight: '400',
				}
			},
			tooltip: {},
			xAxis: { //X轴
				data: ["站点一", "站点二", "站点三", "站点四", "站点五", "站点六", "站点七", "站点八"],
			},
			yAxis: {}, //Y轴
			series: [{
				//name: '销量',
				type: 'bar',
				data: seData,
				itemStyle: {
					normal: {
						color: '#8ad6f6'
					}
				}
			}]
		};
		myChart3.setOption(option3);
	}
	chart3([])

	//	超标情况查询
	$('#excessiveSubmit').click(function() {
		var arrRnd = []
		for(var i = 0; i < 13; i++) {
			var num = rnd(0, 100);
			arrRnd.push(num)
		}
		chart4(arrRnd)
	})

	function chart4(seData) {
		var myChart4 = echarts.init(document.getElementById('excessiveChart'));
		var option4 = {
			title: {
				text: '超标情况查询',
				left: 15,
				textStyle: {
					color: '#82cae8',
					fontWeight: '400',
				}
			},
			grid: {
				show: false
			},
			tooltip: {},
			xAxis: { //X轴
				spiltLine: [{
					show: false,
					interval: 1
				}],
				data: ["0:00", "2:00", "4:00", "6:00", "8:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"],
			},
			yAxis: {}, //Y轴
			series: [{
				//name: '销量',
				type: 'scatter',
				data: seData,
				itemStyle: {
					normal: {
						color: '#8ad6f6'
					}
				}
			}]
		};
		myChart4.setOption(option4);
	}
	chart4([])

	//	噪声分布图
	function distribute(arrDis) {
		var myChart5 = echarts.init(document.getElementById('distributeChart'));
		var option = {
			title: {
				text: '噪声分布',
				left: 15,
				textStyle: {
					color: '#82cae8',
					fontWeight: '400',
				}
			},
			tooltip: {
				trigger: 'axis'
			},
			xAxis: {
				type: 'time',
				splitLine: {
					show: false
				}
			},
			yAxis: {
				type: 'value',
				splitTick: {
					show: false
				}
			},
			dataZoom: [{
				//		            startValue: '201701/01'
			}, {
				type: 'inside'
			}],
			visualMap: {
				top: 10,
				right: 10,
				pieces: [{
					gt: 0,
					lte: 20,
					color: '#096'
				}, {
					gt: 20,
					lte: 40,
					color: '#ffde33'
				}, {
					gt: 40,
					lte: 60,
					color: '#ff9933'
				}, {
					gt: 60,
					lte: 80,
					color: '#cc0033'
				}, {
					gt: 80,
					color: '#660099'
				}],
				outOfRange: {
					color: '#999'
				}
			},
			series: {
				name: '噪声',
				type: 'line',
				data: arrDis,
				itemStyle: {
					normal: {
						color: '#8ad6f6'
					}
				}
			}
		}
		myChart5.setOption(option);
	}
	distribute([]);

	var now = new Date(2017, 0, 1, 0, 0, 0);

	function toDou(n) {
		return n < 10 ? '0' + n : '' + n;
	}
	var oneDay = 3600 * 1000;
	var value = Math.random() * 100;

	function randomData() {
		now = new Date(+now + oneDay);
		value = rnd(0, 100);
		return {
			name: now.toString(),
			value: [
				[now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/') + ' ' + [toDou(now.getHours()), toDou(now.getMinutes()), toDou(now.getSeconds())].join(':'),
				Math.round(value)
			]
		}
	}
	$('#distributeSubmit').click(function() {
		var dateNum3 = $('#datepicker3').datepicker("getDate");
		var dateNum4 = $('#datepicker4').datepicker("getDate");
		if(dateNum3 == null && dateNum4 == null) {
			return;
		}
		var dayNum3 = dateNum3.toString().match(/\d{2}/)[0];
		var dayNum4 = dateNum4.toString().match(/\d{2}/)[0];
		var iDay = dayNum4 - dayNum3;
		var arrDis = [];
		var value1 = $('#datepicker3').val();
		var arrVal = value1.split('-');
		now = new Date(arrVal[0], arrVal[1] - 1, arrVal[2], 0, 0, 0)
		for(var i = 0; i < (24 * iDay); i++) {
			arrDis.push(randomData());
		}
		distribute(arrDis)

	})
	//	自动监测信息图
	function monitor(arrMon) {
		var myChart6 = echarts.init(document.getElementById('monitorChart'));
		var option = {
			title: {
				text: '自动监测信息查询',
				left: 15,
				textStyle: {
					color: '#82cae8',
					fontWeight: '400',
				}
			},
			tooltip: {
				trigger: 'axis'
			},
			xAxis: {
				type: 'time',
				splitLine: {
					show: false
				}
			},
			yAxis: {
				type: 'value',
				splitTick: {
					show: false
				}
			},
			dataZoom: [{
				//		            startValue: '2014-06-01'//起始数值
			}, {
				type: 'inside'
			}],
			visualMap: {
				top: 10,
				right: 30,
				min: 0,
				max: 100,
				splitNumber: 5,
				color: ['#d94e5d', '#eac736', '#50a3ba'],
				textStyle: {
					color: '#000'
				}
			},
			series: {
				name: '站点',
				type: 'scatter',
				data: arrMon
			}
		}
		myChart6.setOption(option);
	}
	monitor([]);
	$('#monitorSubmit').click(function() {
		var dateNum5 = $('#datepicker5').datepicker("getDate");
		var dateNum6 = $('#datepicker6').datepicker("getDate");
		if(dateNum5 == null && dateNum6 == null) {
			return;
		}
		var dayNum5 = dateNum5.toString().match(/\d{2}/)[0];
		var dayNum6 = dateNum6.toString().match(/\d{2}/)[0];
		var iDay = dayNum6 - dayNum5;
		var arrMon = [];
		var value1 = $('#datepicker5').val();
		var arrVal = value1.split('-');
		now = new Date(arrVal[0], arrVal[1] - 1, arrVal[2], 0, 0, 0)
		for(var i = 0; i < (24 * iDay); i++) {
			arrMon.push(randomData());
		}
		monitor(arrMon)
	})
	//设置表格背景
	for(var i = 0; i < oTableColor.length; i++) {
		if(i % 2) {
			oTableColor[i].style.background = '#f7f7f7';

		} else {
			oTableColor[i].style.background = '#fff';
		}
	}

}