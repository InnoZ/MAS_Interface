jQuery(function() {
  jQuery('#district-geometry').each(function() {
    staticDistrictMap('district-geometry', window.districtGeometry, 'rgb(206, 210, 236)');
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
      return chart;
    });
  });
});
