jQuery(function() {
  jQuery('#grid-map').each(function() {
    var modeMaxCount;
    var currentData;
    var modeColor;

    var resizeMap = function() {
      var mapHeight = jQuery(window).height() - jQuery('header').height();
      jQuery('#grid-map').height(mapHeight);
    };
    resizeMap();
    jQuery(window).resize(function() {
      // delay for browser minimizing/maximizing
      setTimeout(function() { resizeMap() }, 100);
    });
    jQuery('.navbar-collapse').on('shown.bs.collapse', function() { resizeMap(); });
    jQuery('.navbar-collapse').on('hidden.bs.collapse', function() { resizeMap(); });

    // disable zoomControl and scaleControl
    var map = L.map('grid-map', {
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

    var district = L.geoJson(window.districtGeometry);
    district.setStyle({ fillOpacity: 0, stroke: true, color: '#575757' });
    district.addTo(map);
    map.fitBounds(district.getBounds());

    // add innoz mapbox tilelayer
    L.tileLayer('//{s}.tiles.mapbox.com/v3/innoz-developer.h1ma7egc/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var onEachFeature = function (feature, layer) {
      layer._leaflet_id = feature.id; // for 'getLayer' function
      var opacity = (feature.properties.featureStarts / modeMaxCount) + 0.05;
      feature.densityStyle = { fillColor: modeColor, fillOpacity: opacity, stroke: false };
      layer.setStyle(feature.densityStyle);
      var mode = jQuery('.od-mode-selector.active').attr('od_mode');
      function mouseover(e) {
        layer.setStyle({weight: 3, color: 'black', stroke: true});
        hideAllFeatures();
        highlightDestinations(feature);
      };
      function mouseout(e) {
        layer.setStyle({stroke: false});
        highlightDensities();
      };
      layer.on('mouseover', mouseover);
      layer.on('mouseout', mouseout);
    };

    var highlightDestinations = function(feature) {
      jQuery.each(feature.properties.destinations, function(index, destination) {
        for (var id in destination){
          var count = destination[id];
          var opacity = (count / feature.properties.featureMaxCount) + 0.05;
          var style = { fillColor: modeColor, fillOpacity: opacity, stroke: (id == feature.id) ? true : false };
          odLayer.getLayer(id).setStyle(style);
        };
      });
    };

    var hideAllFeatures = function() {
      jQuery.each(currentData.features, function(index, feature) {
        odLayer.getLayer(feature.id).setStyle({fillOpacity: 0});
      });
    };

    var highlightDensities = function() {
      jQuery.each(currentData.features, function(index, feature) {
        odLayer.getLayer(feature.id).setStyle(feature.densityStyle);
      });
    };

    odLayer = L.geoJson(null, {onEachFeature: onEachFeature});
    odLayer.addTo(map);

    jQuery('.od-mode-selector').click(function() {
      jQuery(this).addClass('active').siblings().removeClass('active');
      var mode = jQuery(this).attr('od_mode');
      currentData = window.odRelations[mode];
      modeColor = d3.rgb(window.modeColors[mode]);
      modeMaxCount = currentData.properties.maxCount;
      odLayer.clearLayers();
      odLayer.addData(currentData);
      jQuery('.total-count').html(window.odRelations[mode].properties.totalCount);
      jQuery('.total-count-container').css('background', modeColor);
    });

    jQuery('.od-mode-selector').first().click();
  });
});
