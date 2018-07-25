jQuery(function() {
  jQuery('#scenario-show').each(function() {

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
      var modalSplitDiv = '#modal-split-chart-' + ab;
      jQuery(modalSplitDiv).closest('.panel-body').append("<div class='loading'>loading...</div>");
      var trafficPerformanceDiv = '#traffic-performance-chart-' + ab;
      jQuery(trafficPerformanceDiv).closest('.panel-body').append("<div class='loading'>loading...</div>");
      var carbonEmissionDiv = '#carbon-emission-chart-' + ab;
      jQuery(carbonEmissionDiv).closest('.panel-body').append("<div class='loading'>loading...</div>");
      var carbonEmissionAbsDiv = '#carbon-emission-absolute-chart-' + ab;
      jQuery(carbonEmissionAbsDiv).closest('.panel-body').append("<div class='loading'>loading...</div>");
      var diurnalCurveDiv = '#diurnal-curve-chart-' + ab;

      if (typeof window['map_' + ab] == "undefined") {
        jQuery(diurnalCurveDiv).closest('.panel-body').append("<div class='loading'>loading...</div>");
        var densityMapDiv = '#density-map-' + ab;
        jQuery(densityMapDiv).closest('.panel-body').append("<div class='loading'>loading...</div>");
        var odMapDiv = '#od-map-' + ab;
        jQuery(odMapDiv).closest('.panel-body').append("<div class='loading'>loading...</div>");
      }

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
          makePieChart(modalSplitDiv, data.modal_split, 'share');
          makePieChart(trafficPerformanceDiv, data.traffic_performance, 'traffic');
          makePieChart(carbonEmissionDiv, data.carbon_emission, 'carbon');
          makeBarChart(carbonEmissionAbsDiv, data.carbon_emission, 'carbon');
          if (typeof window['map_' + ab] == "undefined") {
            makeDiurnalCurve(diurnalCurveDiv, data.diurnal_json)
            makeDensityMap(densityMapDiv, data.od_relations, data);
            makeODMap(odMapDiv, data.od_relations, data);
          }
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
});