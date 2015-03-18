
function addLayers() {
  var osm = new L.TileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
  var mapbox = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/xslim.hgm2p8g2/{z}/{x}/{y}.png');
  var gmap = new L.Google('ROADMAP');
  var openseamap = new L.TileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png');
  var transas = new L.tileLayer('http://wms.transas.com/tms/1.0.0/tx97/{z}/{x}/{y}.png?token={token}', {
            maxZoom: 17,
            attribution: 'Map data &copy; Transas',
            tileSize: 256,
            tms: true,
            token: '7d6b0e2c-3684-40de-8b8c-c50deea14231'
        });
  map.addLayer(mapbox);
  map.addControl(new L.Control.Layers( {'OSM':osm, 'Mapbox':mapbox, 'Google':gmap, 'Transas':transas}, {'OpenSeaMap':openseamap}));
}
