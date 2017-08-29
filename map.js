var latlng = [52.4124, 4.8133]; //[52.370778285097515, 5.031566619873047]
var zoom = 7;
var map;
var drawnItems;

function onLocationFound(e) {
  var radius = e.accuracy / 2;
  L.marker(e.latlng).addTo(map).bindPopup("You are within " + radius + " meters from this point").openPopup();
  L.circle(e.latlng, radius).addTo(map);
}

function onLocationError(e) {
  alert(e.message);
}

function addLayers() {
  
  var baseMaps = {}
  var subLayers = {}
  
  
  baseMaps['OSM'] = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').;
  baseMaps['MapBox'] = L.tileLayer('http://{s}.tiles.mapbox.com/v3/xslim.hgm2p8g2/{z}/{x}/{y}.png');
  overlayMaps['OpenSeaMap'] = L.tileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png');
  
  var transasToken = '9e53bcb2-01d0-46cb-8aff-512e681185a4'
  var transasUrl = 'http://wms.transas.com/tms/1.0.0/{id}/{z}/{x}/{y}.png?token=' + transasToken
  baseMaps['TX97'] = L.tileLayer(transasUrl, {id: 'tx97', maxZoom: 17, tms: true});
  baseMaps['UTT'] = L.tileLayer(transasUrl, {id: 'utt', maxZoom: 17, tms: true});
  overlayMaps['TX97-Transp'] = L.tileLayer(transasUrl, {id: 'tx97-transp', maxZoom: 17, tms: true});
  
  drawnItems = new L.FeatureGroup();
  overlayMaps['Route'] = drawnItems
  
  baseMaps['OSM'].addTo(map);
  //map.addLayer(drawnItems);
  map.addLayer(drawnItems);
  L.control.layers(baseMaps, overlayMaps).addTo(map);
}

function setupDrawing() {
  var drawControl = new L.Control.Draw({
       draw: {
          polyline: true,
          polygon: false,
          rectangle: false,
          circle: false,
          marker: true,
          circlemarker: false
      },
      edit: {
          featureGroup: drawnItems,
          remove: true
      }
     });
     map.addControl(drawControl);
  
  // Truncate value based on number of decimals
  var _round = function(num, len) {
    return Math.round(num*(Math.pow(10, len)))/(Math.pow(10, len));
  };
  // Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
  var strLatLng = function(latlng) {
    return "("+_round(latlng.lat, 6)+", "+_round(latlng.lng, 6)+")";
  };
  
  // Generate popup content based on layer type
  var getPopupContent = function(layer) {
     if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
         return strLatLng(layer.getLatLng());
     } else if (layer instanceof L.Polyline) {
         var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
             distance = 0;
         if (latlngs.length < 2) {
             return "Distance: N/A";
         } else {
             for (var i = 0; i < latlngs.length-1; i++) {
                 distance += latlngs[i].distanceTo(latlngs[i+1]);
             }
             //return "Distance: "+_round(distance, 2)+" m";
             return "Distance: " + L.GeometryUtil.readableDistance(distance, 'nauticalMile');
         }
     }
     return null;
   };
  
  
  // Object created - bind popup to layer, add to feature group
    map.on(L.Draw.Event.CREATED, function(event) {
        var layer = event.layer;
        var content = getPopupContent(layer);
        if (content !== null) {
            layer.bindPopup(content);
        }
        drawnItems.addLayer(layer);
    });

    // Object(s) edited - update popups
    map.on(L.Draw.Event.EDITED, function(event) {
        var layers = event.layers,
            content = null;
        layers.eachLayer(function(layer) {
            content = getPopupContent(layer);
            if (content !== null) {
                layer.setPopupContent(content);
            }
        });
    });
}

function initmap() {
  //map = L.map('map').setView(latlng, zoom);
  //map.on('locationfound', onLocationFound);
  //map.on('locationerror', onLocationError);
  
  var map = L.map('map', {
        center: latlng,
        zoom: zoom
    });
  
  addLayers();
  setupDrawing();
  
  L.control.scale().addTo(map);
  //map.locate({setView: true, maxZoom: 16});
}
