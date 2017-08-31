/*

center=lat,lon
zoom=5

maptype=
base= ?
overlay=?

path=color:0x0000ff80|weight:1|lat1,lon1|lat2,lon2
path=color:0x0000ff80|weight:1|enc:XXXXXXXX

*/


L.Permalink = {
  
    parseSecondQuery: function(str, name) {
      var bit, query = {}, first, second;
      if (str.includes('|')) {
        var s = str.split("|");
        var s_length = s.length;
        for (var i = 0; i < s_length; i++) {
          
          if (s[i].includes(':')) {
            bit = s[i].split(":");
            first = bit[0];
            if (first.length == 0) continue;
            second = bit[1];
            query[first] = second;
          } else {
            query[name] = s[i];
          }
        }
      } else if (str.includes(':')) {
        bit = str.split(":");
        first = bit[0];
        second = bit[1];
        query[first] = second;
      }
      return query;
    },
  
    parseQuery: function(str) {
      if (typeof str != "string" || str.length == 0) return {};
      var s = str.split("&");
      var s_length = s.length;
      var bit, query = {}, first, second;
      for (var i = 0; i < s_length; i++) {
        bit = s[i].split("=");
        first = decodeURIComponent(bit[0]);
        if (first.length == 0) continue;
        second = decodeURIComponent(bit[1]);
        
        if (second.includes('|') || second.includes(':')) {
          second = L.Permalink.parseSecondQuery(second, first);
        }
        
        if (typeof query[first] == "undefined") {
          query[first] = second;
        } else if (query[first] instanceof Array) {
          query[first].push(second);
        } else {
          query[first] = [query[first], second]; 
        }
      }
      
      if (query['path'] && query.path['enc']) {
        query['path'] = L.Polyline.fromEncoded(query.path['enc']);
      }
      
      if (query['center']) {
        var parts = query['center'].split(',');
        query['center'] = {
            lat: parseFloat(parts[0]),
            lng: parseFloat(parts[1])
        };
      }
      
      if (query['zoom']) {
        query['zoom'] = parseInt(query['zoom'], 10);
      }
      
      return query;
    },
    
    parsePermalink: function(defaults = {zoom: 3, center: [35,0]}) {
      var path = null;
      if (window.location.search !== '') {
        path = window.location.search.replace('?', '');
      } else if (window.location.hash !== '') {
        path = window.location.hash.replace('#', '');
      }
      
      if (path) {
        var query = L.Permalink.parseQuery(path);
        
        let actual = Object.assign({}, defaults, query);
        return actual;
      }
      return defaults;
    },
  
    //gets the map center, zoom-level and rotation from the URL if present, else uses default values
    getMapLocation: function (zoom, center) {
        'use strict';
        zoom = (zoom || zoom === 0) ? zoom : 18;
        center = (center) ? center : [52.26869, -113.81034];

        if (window.location.hash !== '') {
            var hash = window.location.hash.replace('#', '');
            var parts = hash.split(',');
            if (parts.length === 3) {
                center = {
                    lat: parseFloat(parts[0]),
                    lng: parseFloat(parts[1])
                };
                zoom = parseInt(parts[2].slice(0, -1), 10);
            }
        }
        return {zoom: zoom, center: center};
    },

    getPolyline: function(drawnItems) {
      if (!drawnItems) return null;
      var polyline = null;
      
      drawnItems.eachLayer(function(layer){
        if (layer instanceof L.Polyline) {
          polyline = layer
          return;
        }
      })
      return polyline;
    },
    
    update: function () {
        // if (!shouldUpdate) {
        //     // do not update the URL when the view was changed in the 'popstate' handler (browser history navigation)
        //     shouldUpdate = true;
        //     return;
        // }
        
        var center = map.getCenter();
        var state = {
            zoom: map.getZoom(),
            center: center
        };
        
        var hash = [
          'center=' +
            Math.round(state.center.lat * 100000) / 100000 + ',' +
            Math.round(state.center.lng * 100000) / 100000 + '',
          'zoom=' + map.getZoom()
        ];
        
        if (window.api.drawControl) {
          var drawnItems = window.api.drawControl.options.edit.featureGroup;
          var polyline = L.Permalink.getPolyline(drawnItems)
          if (polyline) {
            hash.push('path=enc:' + polyline.encodePath());
          }
        }
        
        
        //polyline.encode()
          
          
        var hashUrl = '#' + hash.join('&')
        window.history.pushState(state, 'map', hashUrl);
    },

    setup: function (map) {
        'use strict';
        // var shouldUpdate = true;

        map.on('moveend', L.Permalink.update);

        // restore the view state when navigating through the history, see
        // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
        // window.addEventListener('popstate', function (event) {
        //     if (event.state === null) {
        //         return;
        //     }
        //     map.setView(event.state.center, event.state.zoom);
        //     shouldUpdate = false;
        // });
    }
};