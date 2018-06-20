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
    staticDistrictMap('district-geometry', window.districtGeometry, 2, {
      fillOpacity: 0,
      opacity: 0
    }, true);
  });

  var drawTooltip = function(color, key, value) {
    content = '<h3 style="color: white; background-color: ';
    content += color + '">';
    content += key + '</h3>' + '<p>' + value + '</p>';
    return content;
  };

  var makePieChart = function(div, data, attribute) {
    var chart = nv.models.pieChart()
      .x(function(d) {
        return d.mode
      })
      .y(function(d) {
        return d[attribute]
      })
      .showLabels(true)
      .labelType("percent")
      .showLegend(false)
      .donut(true)
      .donutRatio(0.35)

    chart.tooltip.contentGenerator(function(obj) {
      return drawTooltip(obj.color, I18n.mode_names[obj.data.mode], obj.data[attribute]);
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
        .x(function(d) {
          return d[0];
        })
        .y(function(d) {
          return d[1];
        })
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

    var year = window['yearScenario' + ab.toUpperCase()];
    var districtId = window['districtIdScenario' + ab.toUpperCase()];

    if (typeof year !== 'undefined') {
      getChartData(year, districtId, ab, {
        motorized_share: 1,
        car_carbon: 1
      });
    };
  });

  var drawComparisonValues = function(data) {
    $.each(data, function(feature, values) {
      $.each(values, function(mode, value) {
        $('.comparision-value[feature=' + feature + '][mode=' + mode + ']').text((value > 0 ? '+' : '') + value + ' ' + values.unit)
      })
    });
  };

  $('#comparison').find('p').append("<div class='loading'>loading...</div>")
  $.ajax({
    data: {
      year_a: window['yearScenarioA'],
      year_b: window['yearScenarioB'],
      district_id: window['districtIdScenarioA']
    },
    url: "/scenario_comparison_data",
    type: 'GET',
    dataType: 'json', // added data type
    success: function(data) {
      $('#comparison').find('.loading').remove();
      drawComparisonValues(data)
    }
  });

  function getChartData(year, districtId, ab, modifiers) {
    jQuery('#pie-charts').find('.loading').remove();
    $('#pie-charts, #line-charts').find('.panel-body').append("<div class='loading'>loading...</div>");
    $.ajax({
      data: {
        year: year,
        district_id: districtId,
        modifiers: modifiers
      },
      url: "/scenario_data",
      type: 'GET',
      dataType: 'json', // added data type
      success: function(data) {
        jQuery('#pie-charts').find('.loading').remove();
        makePieChart('#modal-split-chart-' + ab, data.modal_split, 'share');
        makePieChart('#traffic-performance-chart-' + ab, data.traffic_performance, 'traffic');
        makePieChart('#carbon-emission-chart-' + ab, data.carbon_emission, 'carbon');
        jQuery('#line-charts').find('.loading').remove();
        makeDiurnalCurve('#diurnal-curve-chart-' + ab, data.diurnal_json)
        jQuery('#density-map-section').find('.loading').remove();
        makeDensityMap('density-map-' + ab, data.od_relations, data);
        jQuery('#od-map-section').find('.loading').remove();
        makeODMap('od-map-' + ab, data.od_relations, data);
      }
    });
  };

  var timer;
  $("#motorized-share-slider").slider({
    min: -100,
    max: 100,
    slide: function(event, ui) {
      clearTimeout(timer);
      var year = window['yearScenarioB'];
      var districtId = window['districtIdScenarioB'];
      timer = setTimeout(function() {
        var carCarbon = $("#car-carbon-slider").slider("value");
        getChartData(year, districtId, 'b', {
          motorized_share: ui.value / 10,
          car_carbon: carCarbon / 10
        })
      }, 500);
    }
  });

  $("#car-carbon-slider").slider({
    min: -100,
    max: 100,
    slide: function(event, ui) {
      clearTimeout(timer);
      var year = window['yearScenarioB'];
      var districtId = window['districtIdScenarioB'];
      timer = setTimeout(function() {
        var motorizedShare = $("#motorized-share-slider").slider("value");
        getChartData(year, districtId, 'b', {
          motorized_share: motorizedShare / 10,
          car_carbon: ui.value / 10
        })
      }, 500);
    }
  });
});