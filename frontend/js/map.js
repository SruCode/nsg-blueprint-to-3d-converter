/* ==================================================================
   SIH1773 :: map.js
   Initializes the offline-capable GIS / satellite context map inside
   #map-container using Leaflet.js v1.9.4.

   Exposes:
     window.tacticalMap        -> the Leaflet map instance
     window.setTargetMarker()  -> move/rename the target marker
   so other modules (e.g. app.js) can reference or update it.
================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     Default tactical coordinates — Delhi NSG HQ sector.
  ---------------------------------------------------------------- */
  var DEFAULT_COORDS = [28.5422, 77.1260];
  var DEFAULT_ZOOM = 16;

  /* ----------------------------------------------------------------
     Custom neon target-marker icon, built from an inline SVG so the
     whole app stays zero-dependency (no external icon image files).
  ---------------------------------------------------------------- */
  function buildTargetIcon() {
    var svg =
      '<svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="17" cy="17" r="15" fill="rgba(0,255,204,0.12)" stroke="#00ffcc" stroke-width="1.5"/>' +
        '<circle cx="17" cy="17" r="8" fill="none" stroke="#00ffcc" stroke-width="1.5"/>' +
        '<circle cx="17" cy="17" r="2.5" fill="#00ffcc"/>' +
        '<line x1="17" y1="0" x2="17" y2="7" stroke="#00ffcc" stroke-width="1.5"/>' +
        '<line x1="17" y1="27" x2="17" y2="34" stroke="#00ffcc" stroke-width="1.5"/>' +
        '<line x1="0" y1="17" x2="7" y2="17" stroke="#00ffcc" stroke-width="1.5"/>' +
        '<line x1="27" y1="17" x2="34" y2="17" stroke="#00ffcc" stroke-width="1.5"/>' +
      '</svg>';

    return L.divIcon({
      className: 'tactical-target-icon',
      html: svg,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
  }

  /* ----------------------------------------------------------------
     Initialize the Leaflet map instance.
  ---------------------------------------------------------------- */
  function initTacticalMap() {
    var mapEl = document.getElementById('map-container');
    if (!mapEl) {
      console.warn('[map.js] #map-container not found — skipping map init.');
      return null;
    }

    var map = L.map('map-container', {
      center: DEFAULT_COORDS,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true
    });

    /* --------------------------------------------------------------
       Tile layer & local fallback display.
    -------------------------------------------------------------- */
    /* Adjust path based on where assets folder lives relative to frontend/ */
    var imagePath = '../assets/map_tiles/27.png'; // or '/nsg-blueprint-to-3d-converter/assets/map_tiles/27.png'

    var bounds = [[28.5350, 77.1200], [28.5500, 77.1350]];
    L.imageOverlay(imagePath, bounds).addTo(map);
    map.fitBounds(bounds);  

    /* --------------------------------------------------------------
       Target building marker with a tactical popup readout.
    -------------------------------------------------------------- */
    var targetIcon = buildTargetIcon();
    var targetMarker = L.marker(DEFAULT_COORDS, {
      icon: targetIcon,
      title: 'Target Structure'
    }).addTo(map);

    targetMarker.bindPopup(
      '<div style="font-family: Consolas, monospace; font-size: 11px; line-height:1.6;">' +
        '<strong style="color:#00ffcc;">TARGET STRUCTURE</strong><br/>' +
        'LAT: ' + DEFAULT_COORDS[0].toFixed(4) + '<br/>' +
        'LON: ' + DEFAULT_COORDS[1].toFixed(4) + '<br/>' +
        'STATUS: AWAITING RECON' +
      '</div>'
    );

    /* --------------------------------------------------------------
       Expose instance + helper globally so other scripts can interact.
    -------------------------------------------------------------- */
    window.tacticalMap = map;
    window.tacticalTargetMarker = targetMarker;

    window.setTargetMarker = function (lat, lon, label) {
      var latlng = [lat, lon];
      targetMarker.setLatLng(latlng);
      targetMarker.setPopupContent(
        '<div style="font-family: Consolas, monospace; font-size: 11px; line-height:1.6;">' +
          '<strong style="color:#00ffcc;">' + (label || 'TARGET STRUCTURE') + '</strong><br/>' +
          'LAT: ' + lat.toFixed(4) + '<br/>' +
          'LON: ' + lon.toFixed(4) + '<br/>' +
          'STATUS: LOCKED' +
        '</div>'
      );
      map.panTo(latlng);

      var coordsEl = document.getElementById('mapCoords');
      if (coordsEl) {
        coordsEl.textContent = 'LAT ' + lat.toFixed(4) + ' | LON ' + lon.toFixed(4);
      }
    };

    /* Leaflet needs immediate and delayed resize nudges for CSS flex/grid layout */
    map.invalidateSize();
    setTimeout(function () {
      map.invalidateSize(true);
    }, 250);

    return map;
  }

  /* Run once DOM is ready. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTacticalMap);
  } else {
    initTacticalMap();
  }
})();