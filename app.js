	var latlng = [51.505, -0.09];
	var map = L.map('map').setView(latlng, 6);

		

		L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'examples.map-i875mjb7'
		}).addTo(map);

		function onLocationFound(e) {
			var radius = e.accuracy / 2;

			L.marker(e.latlng).addTo(map)
				.bindPopup("You are within " + radius + " meters from this point").openPopup();

			L.circle(e.latlng, radius).addTo(map);
		}

		function onLocationError(e) {
			alert(e.message);
		}

		map.on('locationfound', onLocationFound);
		map.on('locationerror', onLocationError);

		map.locate({setView: true, maxZoom: 16});
