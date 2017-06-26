jQuery(function() {
  jQuery('#district-geometry').each(function() {
    staticDistrictMap('district-geometry', window.dataScenarioA.district_geometry, 2, {fillOpacity: 0, opacity: 0}, true);
  });

  var makePieChart = function(div, data, attribute) {
    var chart = nv.models.pieChart()
      .x(function(d) { return d.mode })
      .y(function(d) { return d[attribute] })
      .showLabels(true)
      .labelType("percent")
      .showLegend(false)
      .donut(true)
      .donutRatio(0.35)

    chart.tooltip.contentGenerator(function (obj) {
      content = '<h3 style="color: white; background-color: ';
      content += obj.color + '">';
      content += obj.data.mode + '</h3>' + '<p>' + obj.data[attribute] + '</p>';
      return content;
    });

    nv.addGraph(function() {
      d3.select(div)
        .datum(data)
        .transition().duration(350)
        .call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    });
  };

  jQuery('#pie-charts').each(function() {
    jQuery(['a', 'b']).each(function(i, ab) {
      var windowVariableName = 'dataScenario' + ab.toUpperCase();
      var d = window[windowVariableName];
      if (typeof d !== 'undefined') {
        makePieChart('#modal-split-chart-' + ab, d.modal_split.modal_split, 'share');
        makePieChart('#traffic-performance-chart-' + ab, d.traffic_performance.traffic_performance, 'traffic');
        makePieChart('#carbon-emission-chart-' + ab, d.carbon_emission.carbon_emission, 'carbon');
      };
    });
  });

  // jQuery('#diurnal-curve-chart').each(function() {
  //   nv.addGraph(function() {
  //     var chart = nv.models.lineChart()
  //       .x(function(d) { return d[0]; })
  //       .y(function(d) { return d[1]; })
  //       .showLegend(false)
  //       .duration(350);
  //
  //     if(window.location.href.indexOf('/de') > -1) {
  //       chart.yAxis.axisLabel('Anzahl Wege');
  //       chart.xAxis.axisLabel('Stunde');
  //     } else {
  //       chart.yAxis.axisLabel('Trips count');
  //       chart.xAxis.axisLabel('Hour');
  //     };
  //
  //     chart.xAxis.tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
  //     chart.useVoronoi(false);
  //     chart.isArea(false);
  //     chart.useInteractiveGuideline(true);
  //
  //     d3.select('#diurnal-curve-chart')
  //       .datum(diurnalCurve)
  //       .call(chart)
  //     nv.utils.windowResize(chart.update);
  //     return chart;
  //   });
  // });
  //
  // jQuery('#boxplot-chart').each(function() {
  //   nv.addGraph(function() {
  //     var chart = nv.models.boxPlotChart()
  //       .x(function(d) { return d.label })
  //       .staggerLabels(true)
  //       .maxBoxWidth(75)
  //       .yDomain([0, 500])
  //
  //     if(window.location.href.indexOf('/de') > -1) {
  //       chart.yAxis.axisLabel('Reisezeit');
  //     } else {
  //       chart.yAxis.axisLabel('Travel Time');
  //     };
  //     chart.yAxis.tickFormat(d3.format(".0f"));
  //
  //     d3.select('#boxplot-chart')
  //       .datum(boxplot)
  //       .call(chart);
  //     nv.utils.windowResize(chart.update);
  //     return chart;
  //   });
  // });
});
