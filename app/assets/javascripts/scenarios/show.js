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
    district.setStyle({ fillOpacity: 0, stroke: true, color: '#575757' });
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
      layer.setStyle({ fillColor: '#575757', fillOpacity: 0.1, stroke: false });
      var destinations = feature.properties.destinations;
      var mode = jQuery('.od-mode-selector.active').attr('od_mode');
      var colorRangeMax = feature.properties.featureMaxCount;
      var colorRange = d3.scale.linear().domain([1, colorRangeMax])
        .interpolate(d3.interpolateRgb)
        .range([brightColor, darkColor]);
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
            odLayer.getLayer(id).setStyle({fillColor: 'grey', fillOpacity: 0.1});
          };
        };
      });
    };

    odLayer = L.geoJson(null, {onEachFeature: onEachFeature});
    odLayer.addTo(map);

    jQuery('.od-mode-selector').click(function() {
      jQuery(this).addClass('active').siblings().removeClass('active');
      var mode = jQuery(this).attr('od_mode');
      var color = d3.rgb(window.modeColors[mode]);
      var colorToWhite = d3.scale.linear().domain([0, 1])
        .interpolate(d3.interpolateRgb)
        .range([color, 'white']);
      brightColor = colorToWhite(0.5);
      darkColor = color.darker(2);
      odLayer.clearLayers();
      odLayer.addData(window.odRelations[mode]);
      jQuery('.total-count').html(window.odRelations[mode].properties.totalCount);
      jQuery('.total-count-container').css('background', color);
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

      var unit = (window.location.href.indexOf('/de') > -1) ? 'Wege' : 'trips';

      chart.tooltip.contentGenerator(function (obj) {
        content = '<h3 style="color: white; background-color: ';
        content += obj.color + '">';
        content += obj.data.mode + '</h3>' + '<p>' + obj.data.share + ' ' + unit + '</p>';
        return content;
      });

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
      var chart = nv.models.pieChart()
        .x(function(d) { return d.mode })
        .y(function(d) { return d.traffic })
        .showLabels(true)
        .labelType("percent")
        .showLegend(true)
        .donut(true)
        .donutRatio(0.35)

      var unit = (window.location.href.indexOf('/de') > -1) ? 'Kilometer' : 'kilometers';

      chart.tooltip.contentGenerator(function (obj) {
        content = '<h3 style="color: white; background-color: ';
        content += obj.color + '">';
        content += obj.data.mode + '</h3>' + '<p>' + obj.data.traffic + ' ' + unit + '</p>';
        return content;
      });

      chart.legend.vers('furious');

      d3.select('#traffic-performance-chart')
        .datum(trafficPerformance.traffic_performance)
        .transition().duration(350)
        .call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    });
  });

  jQuery('#carbon-emission-chart').each(function() {
    nv.addGraph(function() {
      var chart = nv.models.pieChart()
        .x(function(d) { return d.mode })
        .y(function(d) { return d.carbon })
        .showLabels(true)
        .labelType("percent")
        .showLegend(true)
        .donut(true)
        .donutRatio(0.35)

      var unit = (window.location.href.indexOf('/de') > -1) ? 'Kilogramm' : 'kilogram';

      chart.tooltip.contentGenerator(function (obj) {
        content = '<h3 style="color: white; background-color: ';
        content += obj.color + '">';
        content += obj.data.mode + '</h3>' + '<p>' + obj.data.carbon + ' ' + unit + '</p>';
        return content;
      });

      chart.legend.vers('furious');

      d3.select('#carbon-emission-chart')
        .datum(carbonEmission.carbon_emission)
        .transition().duration(350)
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
