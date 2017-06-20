jQuery(function() {
  jQuery('#grid-map').each(function() {
    var modeMaxCount;
    var currentData;
    var modeColor;
    var totalModeCount;

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

    var colorLegend = function(color) {
      var gradient = 'rgba(0,0,0,0) 0%, ' + color + ' 100%';
      jQuery('.current-count-bar')
        .css({'background': 'linear-gradient(to left, ' + gradient + ')'})
        .css({'background': '-webkit-linear-gradient(left, ' + gradient + ')'});
      jQuery('.current-count').css('background', color);
      jQuery('.total-count, .legend-zero').css('color', color);
    };

    var onEachFeature = function (feature, layer) {
      layer._leaflet_id = feature.id; // for 'getLayer' function
      var opacity = (feature.properties.featureStarts / modeMaxCount) + 0.05;
      feature.densityStyle = { fillColor: 'grey', fillOpacity: opacity, stroke: false };
      layer.setStyle(feature.densityStyle);
      var mode = jQuery('.od-mode-selector.active').attr('od_mode');
      function mouseover(e) {
        layer.setStyle({weight: 3, color: 'black', stroke: true});
        hideAllFeatures();
        highlightDestinations(feature);
        featureSelected = true;
      };
      function mouseout(e) {
        featureSelected = false;
        layer.setStyle({stroke: false});
        setTimeout(function() { highlightDensities() }, 200);
      };
      layer.on('mouseover', mouseover);
      layer.on('mouseout', mouseout);
    };

    var highlightDestinations = function(feature) {
      var featureMaxCount = feature.properties.featureMaxCount;
      jQuery('.total-count').html('Total: ' + feature.properties.featureStarts)
      colorLegend(modeColor);
      jQuery('.current-count').html(featureMaxCount);
      jQuery.each(feature.properties.destinations, function(index, destination) {
        for (var id in destination){
          var count = destination[id];
          var opacity = (count / featureMaxCount);
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
      if (!featureSelected) {
        jQuery.each(currentData.features, function(index, feature) {
          odLayer.getLayer(feature.id).setStyle(feature.densityStyle);
          jQuery('.current-count').html(modeMaxCount)
          jQuery('.total-count').html(totalModeCount);

          colorLegend('grey');
        });
      };
    };

    odLayer = L.geoJson(null, {onEachFeature: onEachFeature});
    odLayer.addTo(map);

    jQuery('.od-mode-selector').click(function() {
      jQuery(this).addClass('active').siblings().removeClass('active');
      var mode = jQuery(this).attr('od_mode');
      currentData = window.odRelations[mode];
      modeColor = window.modeColors[mode];
      modeMaxCount = currentData.properties.maxCount;
      totalModeCount = window.odRelations[mode].properties.totalCount;
      odLayer.clearLayers();
      odLayer.addData(currentData);
      colorLegend('grey');
      jQuery('.total-count').html('Total: ' + totalModeCount)
      jQuery('.current-count').html(modeMaxCount)
    });

    jQuery('.od-mode-selector').first().click();
  });
});
