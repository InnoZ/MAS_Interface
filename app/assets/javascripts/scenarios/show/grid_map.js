jQuery(function() {
  var makeODMap = function(div, data, colors) {
    var data = data;
    var colors = colors;
    var modeMaxCount;
    var modeData;
    var modeColor;
    var totalModeCount;
    var selectedLayer;
    var lines;
    var odLayer;

    var resizeMap = function() {
      var mapHeight = jQuery(window).height() - jQuery('header').height() - 100;
      jQuery('#' + div).height(mapHeight);
    };
    resizeMap();
    jQuery(window).resize(function() {
      // delay for browser minimizing/maximizing
      setTimeout(function() { resizeMap() }, 100);
    });
    jQuery('.navbar-collapse').on('shown.bs.collapse', function() { resizeMap(); });
    jQuery('.navbar-collapse').on('hidden.bs.collapse', function() { resizeMap(); });

    // disable zoomControl and scaleControl
    var map = L.map(div, {
      zoomControl: false,
      scaleControl: false,
      maxZoom: 12,
      minZoom: 7,
      scrollWheelZoom: false
    });

    // place zoom control to topright
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // place metric scale to bottomright
    L.control.scale({
      position: 'bottomright',
      imperial: false
    }).addTo(map);

    var district = L.geoJson(window.dataScenarioA.district_geometry);
    district.setStyle({ fillOpacity: 0, stroke: true, color: '#575757' });
    district.addTo(map);
    map.fitBounds(district.getBounds());

    // add innoz mapbox tilelayer
    L.tileLayer('//{s}.tiles.mapbox.com/v3/innoz-developer.h1ma7egc/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var colorLegend = function(color) {
      var gradient = 'rgba(0,0,0,0) 0%, ' + color + ' 100%';
      jQuery('.current-count-bar')
        .css({
          'background': 'linear-gradient(to right, ' + gradient + ')',
          'background': '-webkit-linear-gradient(left, ' + gradient + ')',
          'border-color': color
        });
      jQuery('.legend').css('color', color);
    };

    var onEachFeature = function (feature, layer) {
      layer._leaflet_id = feature.id; // for 'getLayer' function
      var opacity = (feature.properties.featureStarts / modeMaxCount) + 0.05;
      feature.densityStyle = { fillColor: modeColor, fillOpacity: opacity, stroke: false };
      layer.setStyle(feature.densityStyle);
      function click(e) {
        if (lines) { map.removeLayer(lines) };
        if (selectedLayer == layer) {
          unselectAll();
        } else {
          if (selectedLayer) {
            selectedLayer.setStyle({stroke: false});
          };
          selectedLayer = layer;
          layer.setStyle({weight: 2, color: 'white', opacity: 1, stroke: true});
          hideAllFeatures();
          highlightDestinations(feature, layer);
          featureSelected = true;
        };
      };
      layer.on('click', click);
    };

    var unselectAll = function() {
      if (selectedLayer) {
        selectedLayer.setStyle({stroke: false});
        selectedLayer = null;
        featureSelected = false;
        highlightDensities();
      };
    };

    map.on('click', function(e) {
      unselectAll();
      if (lines) { map.removeLayer(lines) };
    });

    var highlightDestinations = function(feature, layer) {
      var featureMaxCount = feature.properties.featureMaxCount;
      jQuery('.total-count').html('Gesamt: ' + feature.properties.featureStarts)
      colorLegend(modeColor);
      jQuery('.current-count').html(featureMaxCount);
      lines = L.featureGroup();
      var selectedCentroid = layer.getBounds().getCenter();
      var counter = 0;
      jQuery.each(feature.properties.destinations, function(index, destination) {
        counter += 1;
        for (var id in destination){
          var count = destination[id];
          var opacity = (count / featureMaxCount);
          var style = { fillColor: modeColor, fillOpacity: opacity, stroke: (id == feature.id) ? true : false };
          var destinationLayer = odLayer.getLayer(id);
          if (destinationLayer) {
            destinationLayer.setStyle(style);
            if (counter < 10) {
              var line = L.polyline(
                [destinationLayer.getBounds().getCenter(), selectedCentroid],
                { color: 'black', weight: 2, opacity: 0.3 }
              );
              line.addTo(lines);
            };
          };
        };
      });
      lines.addTo(map);
    };

    var hideAllFeatures = function() {
      jQuery.each(modeData.features, function(index, feature) {
        odLayer.getLayer(feature.id).setStyle({fillOpacity: 0});
      });
    };

    var highlightDensities = function() {
      if (!featureSelected) {
        jQuery.each(modeData.features, function(index, feature) {
          odLayer.getLayer(feature.id).setStyle(feature.densityStyle);
          jQuery('.current-count').html(modeMaxCount)
          jQuery('.total-count').html('Gesamt: ' + totalModeCount);
          colorLegend(modeColor);
        });
      };
    };

    odLayer = L.geoJson(null, {onEachFeature: onEachFeature});
    odLayer.addTo(map);

    jQuery('.od-mode-selector').click(function() {
      var mode = jQuery(this).attr('od_mode');
      modeData = data[mode];
      modeColor = colors[mode];
      modeMaxCount = modeData.properties.maxCount;
      totalModeCount = modeData.properties.totalCount;
      if (lines) { map.removeLayer(lines) };
      odLayer.clearLayers();
      odLayer.addData(modeData);
      colorLegend(modeColor);
      jQuery('.total-count').html('Gesamt: ' + totalModeCount)
      jQuery('.current-count').html(modeMaxCount)
    });

    jQuery('.od-mode-selector').first().click();
  };

  makeODMap('grid-map-a', window.odRelationsScenarioA, window.dataScenarioA.mode_colors);
  if (typeof window.odRelationsScenarioB !== 'undefined') {
    makeODMap('grid-map-b', window.odRelationsScenarioB, window.dataScenarioB.mode_colors);
  };
});
