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
      maxZoom: 8,
      minZoom: 8
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

    // add innoz mapbox tilelayer
    L.tileLayer('//{s}.tiles.mapbox.com/v3/innoz-developer.h1ma7egc/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var polygonStyle = {
      'color': '#283645',
      'opacity': 0.8,
      'weight': 3,
      'dashArray': '3',
      'fillColor': 'steelblue',
      'fillOpacity': 0.4,
    };

    // add the grid geojson for the district
    var districtGrid = L.geoJson(window.featureCollection, { style: polygonStyle });
    districtGrid.addTo(map);
    map.fitBounds(districtGrid.getBounds());
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
        .y(function(d) { return parseFloat(d.traffic_performance) })
        .showValues(true)
        .staggerLabels(true)

      chart.yAxis.axisLabel('km');

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

      chart.yAxis.axisLabel('CO2');

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
      chart.xAxis.axisLabel('Uhrzeit').tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);

      if(window.location.href.indexOf('de') > -1) {
        chart.yAxis.axisLabel('Wege');
        chart.xAxis.axisLabel('Uhrzeit');
      } else {
        chart.yAxis.axisLabel('Trips');
        chart.xAxis.axisLabel('Time');
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

      if(window.location.href.indexOf('de') > -1) {
        chart.yAxis.axisLabel('Reisezeit');
      } else {
        chart.yAxis.axisLabel('Travel Time');
      };

      d3.select('#boxplot-chart')
        .datum(boxplot)
        .call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    });
  });
});
