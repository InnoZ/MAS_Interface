jQuery(function() {
  jQuery('#district-geometry').each(function() {
    staticDistrictMap('district-geometry', window.districtGeometry, 'rgb(206, 210, 236)');
  });

  jQuery('#grid-map').each(function() {
    var resizeMap = function() {
      var mapHeight = jQuery(window).height() - jQuery('header').height();
      jQuery('#grid-map').height(mapHeight);
    };
    resizeMap();
    jQuery(window).resize(function() {
      // delay for browser minimizing/maximizing
      setTimeout(function() {
        resizeMap()
      }, 100);
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

    var district = L.geoJson(window.districtGeometry);
    district.setStyle({ fillOpacity: 0, stroke: true, color: 'grey' });
    district.addTo(map);
    map.fitBounds(district.getBounds());

    // place zoom control to topright
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // place metric scale to bottomright
    L.control.scale({
      position: 'bottomright',
      imperial: false
    }).addTo(map);

    // add innoz mapbox tilelayer
    L.tileLayer('//{s}.tiles.mapbox.com/v3/innoz-developer.h1ma7egc/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var onEachFeature = function (feature, layer) {
      layer._leaflet_id = feature.id; // for 'getLayer' function
      layer.setStyle({ fillColor: 'steelblue', fillOpacity: 0.1, stroke: false });
      var destinations = feature.properties.destinations;
      var colorRangeMax = feature.properties.featureMaxCount;
      var colorRange = d3.scale.linear().domain([1, colorRangeMax * 0.7])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb('#7bd469'), d3.rgb('#0e5206')]);
      function mouseover(e) {
        layer.setStyle({weight: 2, color: 'red', stroke: true});
        withAllFeatures(destinations, 'highlight', colorRange);
      };
      function mouseout(e) {
        layer.setStyle({stroke: false});
        withAllFeatures(destinations, 'unHighlight', colorRange);
      };
      layer.on('mouseover', mouseover);
      layer.on('mouseout', mouseout);
    };

    var withAllFeatures = function(features, action, colorRange) {
      jQuery.each(features, function(index, value) {
        destination = value;
        for (var id in destination){
          count = value[id];
          if (action == 'highlight') {
            odLayer.getLayer(id).setStyle({fillColor: colorRange(count), fillOpacity: 0.7});
          } else {
            odLayer.getLayer(id).setStyle({fillColor: 'steelblue', fillOpacity: 0.1});
          };
        };
      });
    };

    odLayer = L.geoJson(null, {onEachFeature: onEachFeature});
    odLayer.addTo(map);

    jQuery('.od-mode-selector').click(function() {
      jQuery(this).addClass('active').siblings().removeClass('active');
      var mode = jQuery(this).attr('od_mode');
      odLayer.clearLayers();
      odLayer.addData(window.odRelations[mode]);
      jQuery('.total-count').html(window.odRelations[mode].properties.totalCount);
    });

    jQuery('.od-mode-selector').first().click();
  });

  jQuery('#modal-split-chart').each(function() {
    nv.addGraph(function() {
      var chart = nv.models.pieChart()
        .x(function(d) { return d.mode })
        .y(function(d) { return d.share })
        .showLabels(true)
        .labelType("percent")
        .showLegend(true)
        .donut(true)
        .donutRatio(0.35)

      chart.legend.vers('furious');

      d3.select('#modal-split-chart')
        .datum(modalSplit.modal_split)
        .transition().duration(350)
        .call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    });
  });

  jQuery('#traffic-performance-chart').each(function() {
    nv.addGraph(function() {
      var chart = nv.models.discreteBarChart()
        .x(function(d) { return d.mode })
        .y(function(d) { return parseFloat(d.traffic_performance) / 1000 })
        .showValues(true)
        .staggerLabels(true)
        .valueFormat(d3.format(".0f"));

      chart.yAxis
        .axisLabel('x 1000 km')
        .tickFormat(d3.format(".0f"));

      d3.select('#traffic-performance-chart')
        .datum(trafficPerformance)
        .call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    });
  });

  jQuery('#carbon-emission-chart').each(function() {
    nv.addGraph(function() {
      var chart = nv.models.discreteBarChart()
        .x(function(d) { return d.mode })
        .y(function(d) { return parseFloat(d.carbon_emission) })
        .showValues(true)
        .staggerLabels(true)
        .valueFormat(d3.format(".0f"));

      chart.yAxis
        .axisLabel('kg CO2')
        .tickFormat(d3.format(".0f"));

      d3.select('#carbon-emission-chart')
        .datum(carbonEmission)
        .call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    });
  });

  jQuery('#diurnal-curve-chart').each(function() {
    nv.addGraph(function() {
      var chart = nv.models.lineChart()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; })
        .showLegend(true)
        .duration(350);

      chart.legend.vers('furious');

      if(window.location.href.indexOf('/de') > -1) {
        chart.yAxis.axisLabel('Anzahl Wege');
        chart.xAxis.axisLabel('Stunde');
      } else {
        chart.yAxis.axisLabel('Trips count');
        chart.xAxis.axisLabel('Hour');
      };

      chart.xAxis.tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
      chart.useVoronoi(false);
      chart.isArea(false);
      chart.useInteractiveGuideline(true);

      d3.select('#diurnal-curve-chart')
        .datum(diurnalCurve)
        .call(chart)
      nv.utils.windowResize(chart.update);
      return chart;
    });
  });

  jQuery('#boxplot-chart').each(function() {
    nv.addGraph(function() {
      var chart = nv.models.boxPlotChart()
        .x(function(d) { return d.label })
        .staggerLabels(true)
        .maxBoxWidth(75)
        .yDomain([0, 500])

      if(window.location.href.indexOf('/de') > -1) {
        chart.yAxis.axisLabel('Reisezeit');
      } else {
        chart.yAxis.axisLabel('Travel Time');
      };
      chart.yAxis.tickFormat(d3.format(".0f"));

      d3.select('#boxplot-chart')
        .datum(boxplot)
        .call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    });
  });
});
