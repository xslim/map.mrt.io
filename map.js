
window.api = {};

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
  var overlayMaps = {}
  
  baseMaps['OSM'] = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {});
  
  var mbToken = 'pk.eyJ1IjoieHNsaW0iLCJhIjoicmdIcHBUNCJ9.C0YuPXzXX4_UPIYbWvBdTw',
  mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mbToken;
  //mbUrl = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=' + mbToken;
  baseMaps['Mapbox'] = L.tileLayer(mbUrl, {id: 'mapbox.streets'});
  //baseMaps['Mapbox Basic'] = L.tileLayer(mbUrl, {id: 'mapbox.streets-basic'});
  baseMaps['Emerald'] = L.tileLayer(mbUrl, {id: 'mapbox.emerald'});
  //baseMaps['Outdoors'] = L.tileLayer(mbUrl, {id: 'mapbox.outdoors'});
  //baseMaps['Run-Bike-Hike'] = L.tileLayer(mbUrl, {id: 'mapbox.run-bike-hike'});
  baseMaps['Pirates'] = L.tileLayer(mbUrl, {id: 'mapbox.pirates'});
  
  baseMaps['Satellite'] = L.tileLayer(mbUrl, {id: 'mapbox.streets-satellite'});
  baseMaps['Grayscale'] = L.tileLayer(mbUrl, {id: 'mapbox.light'});
  
  overlayMaps['OpenSeaMap'] = L.tileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {});
  
  var trToken = '9e53bcb2-01d0-46cb-8aff-512e681185a4',
  trUrl = 'http://wms.transas.com/tms/1.0.0/{id}/{z}/{x}/{y}.png?token=' + trToken;
  baseMaps['TX97'] = L.tileLayer(trUrl, {id: 'tx97', maxZoom: 17, tms: true});
  baseMaps['UTT'] = L.tileLayer(trUrl, {id: 'utt', maxZoom: 17, tms: true});
  overlayMaps['TX97-Transp'] = L.tileLayer(trUrl, {id: 'tx97-transp', maxZoom: 17, tms: true});
  
  drawnItems = new L.FeatureGroup();
  overlayMaps['Route'] = drawnItems;
  
  baseMaps['Emerald'].addTo(map);
  overlayMaps['TX97-Transp'].addTo(map);
  overlayMaps['Route'].addTo(map);
  
  //map.addLayer(drawnItems);
  L.control.layers(baseMaps, overlayMaps).addTo(map);
}

// Truncate value based on number of decimals
function _round(num, len) {
  return Math.round(num*(Math.pow(10, len)))/(Math.pow(10, len));
}

// Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
function strLatLng(latlng) {
  return "("+_round(latlng.lat, 6)+", "+_round(latlng.lng, 6)+")";
};

// Generate popup content based on layer type
function getPopupContent(layer) {
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
 }
 
 function attachDrawPopup(layer) {
   var content = getPopupContent(layer);
   if (content !== null) {
       layer.bindPopup(content);
   }
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
  
  // Object created - bind popup to layer, add to feature group
    map.on(L.Draw.Event.CREATED, function(event) {
        var layer = event.layer;
        attachDrawPopup(layer);
        drawnItems.addLayer(layer);
        
        L.Permalink.update();
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
        
        L.Permalink.update();
    });
    
    //window.api.drawnItems = drawnItems;
    window.api.drawControl = drawControl;
}

function initMap() {
  //map = L.map('map').setView(latlng, zoom);
  //map.on('locationfound', onLocationFound);
  //map.on('locationerror', onLocationError);
  
  //var mappos = L.Permalink.getMapLocation(7, [52.4124, 4.8133]);
  var permalink = L.Permalink.parsePermalink();
  
  
  
  map = L.map('map');
  
  if (permalink.path) {
    map.fitBounds(permalink.path.getBounds());
  } else {
    map.setView(permalink.center, permalink.zoom)
  }
  
  L.Permalink.setup(map);
  
  addLayers();
  setupDrawing();
  
  L.control.scale().addTo(map);
  //map.locate({setView: true, maxZoom: 16});
  
  if (permalink.path) {
    attachDrawPopup(permalink.path);
    drawnItems.addLayer(permalink.path);
  }
  
  window.api.map = map;
  
}
