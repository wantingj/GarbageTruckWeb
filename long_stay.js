
function initMap() {
	var eStart = document.getElementById('condStart');
	var eEnd = document.getElementById('condEnd');

	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		disableDefaultUI: true,
		zoomControl: true,
		center: {lat: 22.9927919, lng: 120.1914003}
	});

	var eControl = document.getElementById('control');
	eControl.index = 1;
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(eControl);

	var eCond = document.getElementById('cond');
	var eInfo = document.getElementById('info');
	eInfo.style.display = 'none';

	var targetMarker = new google.maps.Marker({zIndex: google.maps.Marker.MAX_ZINDEX + 1});
	var pointStyle = [{visible: false}, {
		zIndex: 1,
		icon: {
			path: google.maps.SymbolPath.CIRCLE,
			fillColor: "#f75c52",
			fillOpacity: 1,
			strokeOpacity: 0.5,
			strokeWeight: 1,
			scale: 4
		}
	}];

	var searchPoints = () => {
		console.log('search');
		var start = +eStart.value;
		var end = +eEnd.value || 24;
		if (start > end) end = [start, start = end][0];

		map.data.setStyle(function(feature) {
			if ( (start <= feature.getProperty('sHr') && feature.getProperty('sHr') <= end) ||
				(start <= feature.getProperty('eHr') && feature.getProperty('eHr') <= end) ) {
				return pointStyle[1];
			} else {
				return pointStyle[0];
			}
		});
	};

	var initInputTime = () => {
		var hour = new Date().getHours();
		if (hour < 4 && hour > 21) {
			eStart.value = 4;
			eEnd.value = 24;
		} else {
			eStart.value = hour;
			eEnd.value = hour+1;
		}
	};
	map.data.loadGeoJson("long_stay.json");
	initInputTime();
	searchPoints();

	eStart.addEventListener('change', searchPoints);
	eEnd.addEventListener('change', searchPoints);

	// Event: click point, show point info
	map.data.addListener('click', function(event) {
		var marker = event.feature;

		document.getElementById('pName').innerHTML = marker.getProperty('name');
		document.getElementById('area').innerHTML = marker.getProperty('area');
		document.getElementById('village').innerHTML = marker.getProperty('village');
		document.getElementById('nWeekdays').innerHTML = getPointWeekdays('n', marker);
		document.getElementById('rWeekdays').innerHTML = getPointWeekdays('r', marker) || '無';
		document.getElementById('stayTime').innerHTML =
			marker.getProperty('sHr') + ':' +
			(marker.getProperty('sMin')<10 ? '0':'') + marker.getProperty('sMin') + ' ~ ' +
			marker.getProperty('eHr') + ':' +
			(marker.getProperty('eMin')<10 ? '0':'') + marker.getProperty('eMin');
		document.getElementById('diffTime').innerHTML = '' + marker.getProperty('dMin');

		marker.getGeometry().forEachLatLng((latLng) => {
			document.getElementById('pLink').href = 'https://www.google.com.tw/maps?z=17&q=' + latLng.toUrlValue(12);

			targetMarker.setPosition(latLng);
			targetMarker.setMap(map);
		});

		eInfo.style.display = 'block';
	});

	// Event: click map, clear point info
	map.addListener('click', function(e) {
		eInfo.style.display = 'none';
		targetMarker.setMap(null);
	});

	// Event: clear conditions
	document.getElementById('condClear').addEventListener('click', () => {
		document.getElementById('condStart').value = '';
		document.getElementById('condEnd').value = '';

		map.data.setStyle(pointStyle[1]);
	});
}

// Helper: generate string of weekdays
function getPointWeekdays(flag, marker) {
	if (flag != 'n' && flag != 'r') {
		return '';
	}
	var txtMap = ['日','一','二','三','四','五','六'];
	var weekdays = [];
	for (var i = 0; i < 7; i++) {
		if (marker.getProperty(flag+i))
			weekdays.push(txtMap[i]);
	}
	return weekdays.join('、');
}