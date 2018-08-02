var demoReady = function(boolean) {
  jQuery.ajax({
    type: "POST",
    url: "/demo_ready",
    data: {
      demo_ready: boolean
    },
  })
};

jQuery(function() {
  //------------------ MONITOR -------------------------//
  jQuery('#demo-monitor').each(function() {
    window.map = L.map('demo-monitor-map', {
      tap: true,
      tapTolerance: 80,
      zoomControl: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: false,
      zoomSnap: 0.25
    });
    baselayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
      });
    map.addLayer(baselayer);

    var zoomToOsna = function() {
      map.setView([52.27, 8.05], 12);
    };
    zoomToOsna();

    $.get("data_demo_scenario.json", function(data) {
      var startOrEnd = 'start';
      demoData = data;
      jQuery('#data-loading').hide();

      var featureById = {};
      var loadGrid = function(mode) {
        // temporarily use the od data's car dataset for hexagon zoom
        // better create a new clean one soon, because we do not need od data here
        var district = L.geoJson(demoData.od_relations[mode], {
          onEachFeature: function(feature, layer) {
            featureById[feature.id] = layer;
          }
        });
        district.setStyle({
          fillOpacity: 0,
          stroke: false
        });
        district.addTo(map);
      };

      var activityIcons = {
        'home': 'icon-home',
        'education': 'icon-graduation-cap',
        'shopping': 'icon-basket',
        'work': 'icon-briefcase-1',
        'leisure': 'icon-s-dribbble',
        'kindergarten': 'icon-s-github',
        'other': 'icon-record',
      };

      // ActionCable Websocket
      var markers = null;
      var heat = null;
      App.cable.subscriptions.create('DemoChannel', {
        connected: function() {
          demoReady(true);
          console.log('Demo Websocket connected');
        },
        received: function(response) {
          jQuery('#loading-bar').show();
          console.log(response);
          startOrEnd = response.start_or_end;
          reactOnActivatedPolygon(response);
        }
      });

      var reactOnActivatedPolygon = function(response) {
        var color = demoData.mode_colors[response.active_mode];
        var modeName = response.active_mode_name;
        jQuery('#mode-name').html(modeName).css('color', color);

        // no active polygon means that mode is switched
        // thus, change grid to get correct od data
        loadGrid(response.active_mode);

        if (response.active_polygon == '') {
          // do anything? is this possible?
        } else {
          var feature = featureById[parseInt(response.active_polygon)];
          var props = feature.feature.properties[startOrEnd];
          var featureCount = props.featureCount;
          jQuery('#feature-starts').show().html(featureCount + ' ways overall');

          if (markers) {
            map.removeLayer(markers)
          };
          if (heat) {
            map.removeLayer(heat)
          };

          drawHeatmapPoints(props.heatmap_points);
          drawActivityPoints(props.activity_points);
          activitySplit(props.activity_split, color);
          controlLayerVisibility();

          map.fitBounds(feature.getBounds());
        };
        jQuery('.activity-icon').css('color', color);
      };

      var controlLayerVisibility = function() {
        if (jQuery('#heatmap-button-heatmap').hasClass('active')) {
          jQuery('.leaflet-heatmap-layer').show();
          jQuery('.activity-icon').hide();
        } else {
          jQuery('.leaflet-heatmap-layer').hide();
          jQuery('.activity-icon').show();
        }
      };

      jQuery('.heatmap-button').click(function() {
        jQuery('.heatmap-button').toggleClass('active');
        controlLayerVisibility();
      });

      var drawHeatmapPoints = function(heatmapPoints) {
        heat = L.heatLayer(heatmapPoints, {
          radius: 20,
          blur: 38,
        });
        heat.addTo(map);
      };

      var drawActivityPoints = function(activityPoints) {
        markers = L.featureGroup();
        jQuery.each(activityPoints, function(index, elem) {
          var point = elem[0];
          var activity = elem[1];
          var marker = L.tooltip({
            permanent: true,
            direction: 'center',
            className: 'activity-icon ' + activityIcons[activity]
          }).setLatLng(point);
          marker.addTo(markers);
        });
        markers.addTo(map);
      };

      var activitySplit = function(activitySplit, color) {
        var preparedData = jQuery.map(activityIcons, function(_icon, activity) {
          return {
            mode: I18n.activity_names[activity],
            share: activitySplit[activity] ? activitySplit[activity] * 1000 : 1,
          }
        });
        makeHorizontalBarChart('#activity-split', preparedData, 'share');
        setTimeout(function() {
          // timeout hack to assure that chart elements are rendered when applying this
          jQuery('#activity-split rect').css('fill', color);
          // remove existing icons
          jQuery('.activity-legend-icon').remove();
          jQuery.each(activityIcons, function(activity, icon) {
            var iconElement = jQuery("<icon class='activity-legend-icon " + icon + "'></icon>");
            var positionInBarChart = jQuery('text:contains(' + I18n.activity_names[activity] + ')').position();
            iconElement.appendTo(jQuery('#demo-monitor')).css({
              top: positionInBarChart.top - 5,
              left: positionInBarChart.left - 25,
            });
          });

          jQuery('#loading-bar').hide();
          demoReady(true);
        }, 1)
      };
    });
  });

  //--------------------------------------------------//
  //------------------ TOUCH -------------------------//
  //--------------------------------------------------//

  jQuery('#demo-touch').each(function() {
    var startOrEnd = 'start';
    var actionBlocked = false;
    var map, activeMode, activeModeName, modeData, modeColor, selectedLayer, lines, demoData, activePolygonId, odLayer;

    $.get("data_demo_scenario.json", function(data) {
      demoData = data;
      jQuery('#data-loading').hide();

      makeODMap('od-map', demoData.od_relations, demoData);
    });

    App.cable.subscriptions.create('DemoReadyChannel', {
      connected: function() {
        console.log('Demo Ready Websocket connected');
      },
      received: function(response) {
        console.log(response);
        if (response.demo_ready == 'true') {
          jQuery('.action-blocker').hide();
        } else {
          jQuery('.action-blocker').show();
        }
      }
    });

    var findOdFeatureById = function(id) {
      var target = null;
      jQuery.each(odLayer._layers, function(index, elem) {
        if (elem.feature.id == id) {
          target = elem;
          return false;
        }
      });
      return target;
    };

    var makeODMap = function(div, odRelations, data) {
      var legend = jQuery('.legend');

      map = L.map(div, {
        tap: true,
        tapTolerance: 80,
        zoomControl: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        dragging: false,
        zoomSnap: 0.25
      });

      var district = L.geoJson(data.district_geometry);
      district.setStyle({
        fillOpacity: 0,
        stroke: true,
        weight: 2.3,
        color: 'white'
      });
      district.addTo(map);

      var colorLegend = function(color) {
        var gradient = 'black 0%, ' + color + ' 100%';
        legend.find('.current-count-bar')
          .css({
            'background': 'linear-gradient(to bottom, ' + gradient + ')',
            'background': '-webkit-linear-gradient(bottom, ' + gradient + ')',
            'border-color': color
          });
      };

      var setInitialStyle = function() {
        odLayer.setStyle({
          fillOpacity: 0,
          weight: 0
        });
      };

      var featureJustClicked = false;
      var mousePositionX, mousePositionY;
      jQuery('#od-map').click(function(e) {
        if (featureJustClicked == false) {
          mousePositionX = e.clientX;
          mousePositionY = e.clientY;
          jQuery("<div class='empty-click'>No trips here!</div>").appendTo(jQuery('#demo-touch')).css({
            left: mousePositionX,
            top: mousePositionY
          }).fadeOut(2000, function() {
            jQuery(this).remove();
          });
        }
      });

      var onEachFeature = function(feature, layer) {
        feature.clickEvent = function(e) {
          demoReady(false);

          featureJustClicked = true;
          featureClickTimer = setTimeout(function() {
            featureJustClicked = false;
          }, 500)

          if (lines) {
            map.removeLayer(lines)
          };
          selectedLayer = layer;
          setInitialStyle();
          layer.setStyle({
            weight: 3,
            color: 'red',
            opacity: 1
          });
          highlightDestinations(feature, layer);
          activePolygonId = feature.id;
          jQuery.ajax({
            type: "POST",
            url: "/activate_polygon",
            data: {
              active_mode: activeMode,
              active_mode_name: activeModeName,
              active_polygon: activePolygonId,
              start_or_end: startOrEnd,
            },
          })
          featureSelected = true;
          polygonModalSplit(data, activePolygonId);
        };

        layer.on('click', feature.clickEvent);
      };

      var highlightDestinations = function(feature, layer) {
        var featureMaxDestinationCount = feature.properties[startOrEnd].featureMaxDestinationCount;
        colorLegend(modeColor);
        legend.find('.current-count').html(featureMaxDestinationCount);
        lines = L.featureGroup();
        var selectedCentroid = layer.getBounds().getCenter();
        var counter = 0;
        jQuery.each(feature.properties[startOrEnd].destinations, function(index, destination) {
          counter += 1;
          for (var id in destination) {
            var count = destination[id];
            var opacity = (count / featureMaxDestinationCount);
            var style = {
              fillColor: modeColor,
              fillOpacity: opacity
            };
            var destinationLayer = findOdFeatureById(id);
            if (destinationLayer) {
              destinationLayer.setStyle(style);
              if (counter < 10) {
                var fromTo = startOrEnd == 'end' ? [destinationLayer.getBounds().getCenter(), selectedCentroid] : [selectedCentroid, destinationLayer.getBounds().getCenter()];
                var line = L.polyline(
                  fromTo, {
                    color: 'white',
                    weight: 1.5,
                    opacity: 1
                  }
                ).addTo(lines);
                var arrowHead = L.polylineDecorator(line, {
                  patterns: [{
                    offset: '50%',
                    symbol: L.Symbol.arrowHead({
                      pixelSize: 7,
                      polygon: true,
                      pathOptions: {
                        stroke: false,
                        fillOpacity: 1,
                        color: 'white'
                      }
                    })
                  }]
                }).addTo(lines);
              };
            };
          };
        });
        lines.addTo(map);
      };

      jQuery('.od-mode-selector').click(function() {
        activeMode = jQuery(this).attr('od_mode');
        activeModeName = jQuery(this).text();
        modeData = odRelations[activeMode];
        modeColor = data.mode_colors[activeMode];
        if (lines) {
          map.removeLayer(lines)
        };
        if (odLayer) {
          map.removeLayer(odLayer)
        };
        odLayer = L.geoJson(modeData, {
          onEachFeature: onEachFeature
        });
        odLayer.addTo(map);
        map.fitBounds(odLayer.getBounds());
        setInitialStyle();
        colorLegend(modeColor);
        jQuery.ajax({
          type: "POST",
          url: "/activate_polygon",
          data: {
            active_mode: activeMode,
            active_mode_name: activeModeName,
            active_polygon: activePolygonId,
            start_or_end: startOrEnd,
          },
        })
        if (activePolygonId) {
          var activePolygon = findOdFeatureById(activePolygonId);
          if (activePolygon) {
            activePolygon.feature.clickEvent();
          }
        }
      });

      jQuery('.od-mode-selector').first().click();
    };

    var polygonModalSplit = function(data, polygonId) {
      var modalSplit = jQuery.map(data.od_relations, function(modeData, mode) {
        var _data = [];
        jQuery.each(modeData.features, function(id, feature) {
          if (mode !== 'all' && polygonId == feature.id) {
            _data.push({
              mode: mode,
              share: feature.properties[startOrEnd].featureCount,
              color: data.mode_colors[mode],
            });
            return _data;
          } else {
            return true;
          }
        })
        return _data;
      });
      makePieChart('#polygon-modal-split', modalSplit, 'share')
    };

    jQuery('.switch-button').click(function() {
      jQuery('.switch-button').toggleClass('active');
      startOrEnd = jQuery('.switch-button.active').attr('start_or_end');
      if (activePolygonId) {
        findOdFeatureById(activePolygonId).feature.clickEvent();
      }
    });
  });
});