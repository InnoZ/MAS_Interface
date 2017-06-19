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
