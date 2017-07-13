jQuery(function() {
  jQuery('#grid-map-section').each(function() {
    var makeODMap = function(div, odRelations, data) {
      var map;
      var odRelations = odRelations;
      var data = data;
      var modeMaxCount;
      var modeData;
      var modeColor;
      var totalModeCount;
      var selectedLayer;
      var lines;
      var odLayer;

      var legend = jQuery('#' + div).prev('.legend');

      var resizeMap = function() {
        var mapHeight = jQuery(window).height() - jQuery('header').height() - 100;
        jQuery('#' + div).height(mapHeight);
      };
      resizeMap();
      jQuery(window).resize(function() {
        // delay for browser minimizing/maximizing
        setTimeout(function() { resizeMap(); map.invalidateSize(); }, 100);
      });
      jQuery('.navbar-collapse').on('shown.bs.collapse', function() { resizeMap(); });
      jQuery('.navbar-collapse').on('hidden.bs.collapse', function() { resizeMap(); });

      L.mapbox.accessToken = 'pk.eyJ1IjoiaW5ub3otZGV2ZWxvcGVyIiwiYSI6IkRJLTdMWVkifQ.-P3v2RPr4HMr3JfNMxAsgQ';

      map = L.mapbox.map(div, 'innoz-developer.mj43ge61', {
        zoomControl: false,
        scrollWheelZoom: false
      });

      // var map = L.map(div, {
      //   zoomControl: false,
      //   scaleControl: false,
      //   scrollWheelZoom: false
      // });
      //
      // // add innoz mapbox tilelayer
      // L.tileLayer('//{s}.tiles.mapbox.com/v3/innoz-developer.h1ma7egc/{z}/{x}/{y}.png', {
      //   attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      // }).addTo(map);

      // place zoom control to topright
      L.control.zoom({
        position: 'topright'
      }).addTo(map);

      // place metric scale to bottomright
      L.control.scale({
        position: 'bottomright',
        imperial: false
      }).addTo(map);

      var district = L.geoJson(data.district_geometry);
      district.setStyle({ fillOpacity: 0, stroke: true, color: '#575757' });
      district.addTo(map);
      map.fitBounds(district.getBounds());

      var colorLegend = function(color) {
        var gradient = 'rgba(0,0,0,0) 0%, ' + color + ' 100%';
        legend.find('.current-count-bar')
          .css({
            'background': 'linear-gradient(to right, ' + gradient + ')',
            'background': '-webkit-linear-gradient(left, ' + gradient + ')',
            'border-color': color
          });
        legend.css('color', color);
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
            layer.setStyle({weight: 3, color: 'white', opacity: 1, stroke: true});
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
        colorLegend(modeColor);
        legend.find('.total-count').html(I18n.total + ": " + feature.properties.featureStarts)
        legend.find('.current-count').html(featureMaxCount);
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
                  { color: 'white', weight: 2, opacity: 1 }
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
            jQuery('.total-count').html(I18n.total + ": " + totalModeCount);
            colorLegend(modeColor);
          });
        };
      };

      odLayer = L.geoJson(null, {onEachFeature: onEachFeature});
      odLayer.addTo(map);

      jQuery('.od-mode-selector').click(function() {
        var mode = jQuery(this).attr('od_mode');
        modeData = odRelations[mode];
        modeColor = data.mode_colors[mode];
        modeMaxCount = modeData.properties.maxCount;
        totalModeCount = modeData.properties.totalCount;
        if (lines) { map.removeLayer(lines) };
        odLayer.clearLayers();
        odLayer.addData(modeData);
        colorLegend(modeColor);
        legend.find('.total-count').html(I18n.total + ": " + totalModeCount);
        legend.find('.current-count').html(modeMaxCount);
      });

      jQuery('.od-mode-selector').last().click();
    };

    makeODMap('grid-map-a', window.odRelationsScenarioA, window.dataScenarioA);

    jQuery('#accordion').on('shown.bs.collapse', function () {
      if (typeof window.odRelationsScenarioB !== 'undefined') {
        makeODMap('grid-map-b', window.odRelationsScenarioB, window.dataScenarioB);
      };
    });
  });
});
