jQuery(function() {
  jQuery('#density-map-section').each(function() {
    var makeDensityMap = function(div, odRelations, data) {
      var map, modeData, modeColor, totalModeCount, selectedLayer, lines, odLayer;

      var legend = jQuery('#' + div).prev('.legend');

      L.mapbox.accessToken = 'pk.eyJ1IjoiaW5ub3otZGV2ZWxvcGVyIiwiYSI6IkRJLTdMWVkifQ.-P3v2RPr4HMr3JfNMxAsgQ';

      map = L.mapbox.map(div, 'innoz-developer.mj43ge61', {
        zoomControl: false,
        scrollWheelZoom: false,
        maxZoom: 12,
        minZoom: 9,
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
      district.setStyle({ fillOpacity: 0, stroke: true, color: '#575757' });
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

      var onEachFeature = function (feature, layer) {
        var opacity = (feature.properties.featureStarts / modeMaxCount) + 0.1;
        layer.setStyle({ fillColor: modeColor, fillOpacity: opacity,  color: 'grey', opacity: 1, weight: 0.2 });
      };

      jQuery('.density-mode-selector').click(function() {
        var mode = jQuery(this).attr('od_mode');
        modeData = odRelations[mode];
        modeColor = data.mode_colors[mode];
        modeMaxCount = modeData.properties.maxCount;
        totalModeCount = modeData.properties.totalCount;
        if (odLayer) { map.removeLayer(odLayer) };
        odLayer = L.geoJson(modeData, {onEachFeature: onEachFeature});
        odLayer.addTo(map);
        colorLegend(modeColor);
        legend.find('.total-count').html(I18n.total + ": " + totalModeCount);
        legend.find('.current-count').html(modeMaxCount);
      });

      jQuery('.density-mode-selector').last().click();

      // make maps accessable seperately from outside
      if (div == 'density-map-a') {
        mapA = map;
      } else {
        mapB = map;
      };
    };

    makeDensityMap('density-map-a', window.odRelationsScenarioA, window.dataScenarioA);
    if (typeof window.odRelationsScenarioB !== 'undefined') {
      makeDensityMap('density-map-b', window.odRelationsScenarioB, window.dataScenarioB);
    };

    mapA.on('moveend', function() { mapB.fitBounds(mapA.getBounds()) });
    // temporarily disable map b for one-scenario cases
    // mapB.on('moveend', function() { mapA.fitBounds(mapB.getBounds()) });
  });
});
