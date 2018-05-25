var makeODMap = function(div, odRelations, data) {
  var map, modeMaxCount, modeData, modeColor, totalModeCount, selectedLayer, lines, odLayer;

  var legend = jQuery('#' + div).prev('.legend');

  var resizeMap = function() {
    var mapHeight = jQuery(window).height() - jQuery('header').height() - 100;
    jQuery('#' + div).height(mapHeight);
  };
  resizeMap();
  jQuery(window).resize(function() {
    // delay for browser minimizing/maximizing
    setTimeout(function() {
      resizeMap();
      map.invalidateSize();
    }, 100);
  });
  jQuery('.navbar-collapse').on('shown.bs.collapse', function() {
    resizeMap();
  });
  jQuery('.navbar-collapse').on('hidden.bs.collapse', function() {
    resizeMap();
  });

  L.mapbox.accessToken = 'pk.eyJ1IjoiaW5ub3otZGV2ZWxvcGVyIiwiYSI6IkRJLTdMWVkifQ.-P3v2RPr4HMr3JfNMxAsgQ';

  map = L.mapbox.map(div, 'innoz-developer.mj43ge61', {
    zoomControl: false,
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

  var district = L.geoJson(data.district_geometry);
  district.setStyle({
    fillOpacity: 0,
    stroke: true,
    color: '#575757'
  });
  district.addTo(map);
  map.fitBounds(district.getBounds());

  var colorLegend = function(color) {
    var gradient = 'white 0%, ' + color + ' 100%';
    legend.find('.current-count-bar')
      .css({
        'background': 'linear-gradient(to right, ' + gradient + ')',
        'background': '-webkit-linear-gradient(left, ' + gradient + ')',
        'border-color': color
      });
    legend.css('color', color);
  };

  var setInitialStyle = function() {
    odLayer.setStyle({
      fillOpacity: 0,
      color: 'grey',
      opacity: 1,
      weight: 0.2
    });
  };

  var onEachFeature = function(feature, layer) {
    function click(e) {
      if (lines) {
        map.removeLayer(lines)
      };
      selectedLayer = layer;
      layer.setStyle({
        weight: 3,
        color: 'white',
        opacity: 1
      });
      setInitialStyle();
      highlightDestinations(feature, layer);
      featureSelected = true;
    };
    layer.on('click', click);
  };

  var findOdFeatureById = function(id) {
    jQuery.each(odLayer._layers, function(index, elem) {
      if (elem.feature.id == id) {
        target = elem;
        return false;
      }
    });
    return target;
  };

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
      for (var id in destination) {
        var count = destination[id];
        var opacity = (count / featureMaxCount);
        var style = {
          fillColor: modeColor,
          fillOpacity: opacity
        };
        var destinationLayer = findOdFeatureById(id);
        if (destinationLayer) {
          destinationLayer.setStyle(style);
          if (counter < 10) {
            var line = L.polyline(
              [destinationLayer.getBounds().getCenter(), selectedCentroid], {
                color: 'white',
                weight: 2,
                opacity: 1
              }
            );
            line.addTo(lines);
          };
        };
      };
    });
    lines.addTo(map);
  };

  jQuery('.od-mode-selector').click(function() {
    var mode = jQuery(this).attr('od_mode');
    modeData = odRelations[mode];
    modeColor = data.mode_colors[mode];
    modeMaxCount = modeData.properties.maxCount;
    totalModeCount = modeData.properties.totalCount;
    if (lines) {
      map.removeLayer(lines)
    };
    if (odLayer) {
      map.removeLayer(odLayer)
    };
    odLayer = L.geoJson(modeData, {
      onEachFeature: onEachFeature
    });
    odLayer.addTo(map);
    setInitialStyle();
    colorLegend(modeColor);
    legend.find('.total-count').html(I18n.total + ": " + totalModeCount);
    legend.find('.current-count').html(modeMaxCount);
  });

  jQuery('.od-mode-selector').last().click();
};