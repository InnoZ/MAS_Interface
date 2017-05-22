jQuery(function() {
  jQuery('#district-geometry').each(function() {
    staticDistrictMap('district-geometry', window.districtGeometry, 'rgb(206, 210, 236)');
  });

  jQuery('#test-map').each(function() {
    var resizeMap = function() {
      var mapHeight = jQuery(window).height() - jQuery('header').height();
      jQuery('#test-map').height(mapHeight);
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
    var map = L.map('test-map', {
      zoomControl: false,
      scaleControl: false,
      maxZoom: 9,
      minZoom: 7
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

    // add the chosen district polygon
    var districtPolygon = L.geoJson(window.districtFeature, { style: polygonStyle });
    districtPolygon.addTo(map);
    map.fitBounds(districtPolygon.getBounds());

    // add leaflet statistics container and fill it with charts
    var statistics = L.control({position: 'topleft'});

    statistics.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'statistics-container')

      if(window.scenarioSeed === false) {
        div.innerHTML += '<h5>' + 'Landkreis: ' + window.districtName + '</h5>' +
        '<p>' + '<b>' +  'Bezugsjahr: ' + '</b>' + window.modelYear + '</p>' +
        '<p>' + '<b>' + 'Info: ' + '</b>' + window.seedText + '</p>' +
        '<p>' + '<b>' + 'Erstellt am: ' + '</b>' + window.createdAt + '</p>' +
        '<h5>' + 'Modal Split' + '</h5>' + "<svg id='modal-split-chart'></svg>" +
        '<h5>' + 'Verkehrsleistung' + '</h5>' + "<svg id='traffic-performance-chart'></svg>" +
        '<h5>' + 'Tagesganglinie' + '</h5>' + "<svg id='diurnal-curve-chart'></svg>" +
        '<h5>' + 'Boxplot' + '</h5>' + "<svg id='boxplot-chart'></svg>";
        return div;
      } else {
        div.innerHTML += '<h5>' + 'Landkreis: ' + window.districtName + '</h5>' +
        '<p>' + '<b>' +  'Bezugsjahr: ' + '</b>' + window.modelYear + '</p>' +
        '<p>' + '<b>' + 'Info: ' + '</b>' + window.seedText + '</p>' +
        '<p>' + '<b>' + 'Erstellt am: ' + '</b>' + window.createdAt + '</p>' +
        '<h5>' + 'Modal Split' + '</h5>' + "<svg id='modal-split-chart'></svg>";
        return div;
      };
    };

    statistics.addTo(map);

    // Disable dragging when user's cursor enters the element
    statistics.getContainer().addEventListener('mouseover', function () {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    });

    // Re-enable dragging when user's cursor leaves the element
    statistics.getContainer().addEventListener('mouseout', function () {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    });
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

  jQuery('#diurnal-curve-chart').each(function() {
    nv.addGraph(function() {
      var chart = nv.models.lineChart()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; })
        .showLegend(true)
        .duration(350);

      chart.legend.vers('furious');
      chart.xAxis.axisLabel('Uhrzeit').tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
      chart.yAxis.axisLabel('Wege')
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

      chart.yAxis.axisLabel('Reisezeit')

      d3.select('#boxplot-chart')
        .datum(boxplot)
        .call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    });
  });
});
