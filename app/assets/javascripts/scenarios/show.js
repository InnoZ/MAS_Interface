jQuery(function() {
  var IndentHeroOverlay = function() {
    var col = jQuery('section#pie-charts > .container');
    var padding = (jQuery(window).width() - col.width()) / 2 + 10;
    jQuery('.overlay').css('left', padding);
  };

  jQuery(window).resize(function() {
    IndentHeroOverlay();
  }).resize();

  jQuery('#district-geometry').each(function() {
    staticDistrictMap('district-geometry', window.dataScenarioA.district_geometry, 2, {fillOpacity: 0, opacity: 0}, true);
  });

  var drawTooltip = function(color, key, value) {
    content = '<h3 style="color: white; background-color: ';
    content += color + '">';
    content += key + '</h3>' + '<p>' + value + '</p>';
    return content;
  };

  var makePieChart = function(div, data, attribute) {
    var chart = nv.models.pieChart()
      .x(function(d) { return d.mode })
      .y(function(d) { return d[attribute] })
      .showLabels(true)
      .labelType("percent")
      .showLegend(false)
      .donut(true)
      .donutRatio(0.35)

    chart.tooltip.contentGenerator(function(obj) {
      drawTooltip(obj.color, I18n.mode_names[obj.data.mode], obj.data[attribute]);
    });

    chart.tooltip.enabled(false);

    nv.addGraph(function() {
      d3.select(div)
        .datum(data)
        .transition().duration(350)
        .call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    });
  };

  var makeDiurnalCurve = function(div, data) {
    nv.addGraph(function() {
      var chart = nv.models.lineChart()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; })
        .showLegend(false);

      chart.yAxis.axisLabel(I18n.count);
      chart.xAxis.axisLabel('hour');

      chart.xAxis.tickValues([0, '', '', 3, '', '', 6, '', '', 9, '', '', 12, '', '', 15, '', '', 18, '', '', 21, '', '']);
      // deactivate guidelines since tooltip is on wrong position - seemingly this is connected with positioning inside of a bootstrap panel
      chart.useInteractiveGuideline(false);

      chart.tooltip.contentGenerator(function(obj) {
        var o = obj.series[0];
        return drawTooltip(o.color, I18n.mode_names[o.key], o.value);
      });

      d3.select(div)
        .datum(data)
        .call(chart)
        .selectAll(".nv-axisMaxMin-x").remove()
      nv.utils.windowResize(chart.update);
      return chart;
    });
  };

  jQuery(['a', 'b']).each(function(i, ab) {
    var windowVariableName = 'dataScenario' + ab.toUpperCase();
    var d = window[windowVariableName];
    if (typeof d !== 'undefined') {
      makePieChart('#modal-split-chart-' + ab, window['modalSplit' + ab.toUpperCase()], 'share');
      makePieChart('#traffic-performance-chart-' + ab, d.traffic_performance, 'traffic');
      makePieChart('#carbon-emission-chart-' + ab, d.carbon_emission, 'carbon');
      makeDiurnalCurve('#diurnal-curve-chart-' + ab, d.diurnal_json)
    };
  });

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
