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

    var featureById = {};
    var loadGrid = function(mode) {
      // temporarily use the od data's car dataset for hexagon zoom
      // better create a new clean one soon, because we do not need od data here
      var district = L.geoJson(window.data.od_relations[mode], {
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

    jQuery.each(activityIcons, function(mode, icon) {
      jQuery('#activity-legend').append(
        "<icon class='" + icon + "'></icon>" + mode
      );
    });

    // ActionCable Websocket
    var starts = null;
    var heat = null;
    App.demoState = App.cable.subscriptions.create('DemoChannel', {
      connected: function() {
        console.log('Websocket connected');
      },
      received: function(response) {
        var color = data.mode_colors[response.active_mode];
        var modeName = response.active_mode_name;
        jQuery('#mode-name').html(modeName).css('color', color);

        // no active polygon means that mode is switched
        // thus, change grid to get correct od data
        loadGrid(response.active_mode);

        if (response.active_polygon == '') {
          jQuery('#feature-starts').hide();
          if (starts) {
            map.removeLayer(starts)
          };
          if (heat) {
            map.removeLayer(starts)
          };
          zoomToOsna();
          console.log('no polygon clicked yet')
        } else {
          var feature = featureById[parseInt(response.active_polygon)];
          var featureStarts = feature.feature.properties.featureStarts;
          jQuery('#feature-starts').show().html(featureStarts + ' ways').css('color', color);

          if (starts) {
            map.removeLayer(starts)
          };
          if (heat) {
            map.removeLayer(heat)
          };

          drawHeatmapPoints(feature.feature.properties.heatmap_points);
          drawStartPoints(feature.feature.properties.start_points);
          controlLayerVisibility();

          jQuery('.activity-icon').css('color', data.mode_colors[response.active_mode]);
          jQuery('#activity-legend').css('color', data.mode_colors[response.active_mode]);
          map.fitBounds(feature.getBounds());
        };
      }
    });

    var controlLayerVisibility = function() {
      if (jQuery('#heatmap-button').hasClass('active')) {
        jQuery('.leaflet-heatmap-layer').show();
        jQuery('.activity-icon').hide();
      } else {
        jQuery('.leaflet-heatmap-layer').hide();
        jQuery('.activity-icon').show();
      }
    };

    jQuery('#heatmap-button').click(function() {
      jQuery(this).toggleClass('active');
      controlLayerVisibility();
    });

    var drawHeatmapPoints = function(heatmapPoints) {
      heat = L.heatLayer(heatmapPoints, {
        radius: 20,
        blur: 38,
      });
      heat.addTo(map);
    };

    var drawStartPoints = function(startPoints) {
      starts = L.featureGroup();
      jQuery.each(startPoints, function(index, elem) {
        var point = elem[0];
        var activity = elem[1];
        var start = L.tooltip({
          permanent: true,
          direction: 'center',
          className: 'activity-icon ' + activityIcons[activity]
        }).setLatLng(point);
        start.addTo(starts);
      });
      starts.addTo(map);
    };
  });

  //------------------ TOUCH -------------------------//
  jQuery('#demo-touch').each(function() {
    var makeODMap = function(div, odRelations, data) {
      var map, modeMaxCount, activeMode, activeModeName, modeData, modeColor, totalModeCount, selectedLayer, lines, odLayer, activePolygonId;
      var legend = jQuery('.legend');

      map = L.map(div, {
        tap: true,
        tapTolerance: 80,
        zoomControl: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        dragging: false,
      });

      var district = L.geoJson(data.district_geometry);
      district.setStyle({
        fillOpacity: 0,
        stroke: true,
        color: 'red'
      });
      district.addTo(map);
      map.fitBounds(district.getBounds());

      var colorLegend = function(color) {
        var gradient = 'black 0%, ' + color + ' 100%';
        legend.find('.current-count-bar')
          .css({
            'background': 'linear-gradient(to right, ' + gradient + ')',
            'background': '-webkit-linear-gradient(left, ' + gradient + ')',
            'border-color': color
          });
        legend.css('color', color);
      };

      var setInitialStyle = function() {
        odLayer.setStyle({
          fillOpacity: 0,
          weight: 0
        });
      };

      var onEachFeature = function(feature, layer) {
        feature.clickEvent = function(e) {
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
              active_polygon: activePolygonId
            },
          })
          featureSelected = true;
          polygonModalSplit(activePolygonId);
        };

        layer.on('click', feature.clickEvent);
      };

      var findOdFeatureById = function(id) {
        jQuery.each(odLayer._layers, function(index, elem) {
          if (elem.feature.id == id) {
            target = elem;
            return false;
          }
        });
        return target;
      };

      var highlightDestinations = function(feature, layer) {
        var featureMaxCount = feature.properties.featureMaxCount;
        colorLegend(modeColor);
        legend.find('.current-count').html(featureMaxCount);
        lines = L.featureGroup();
        var selectedCentroid = layer.getBounds().getCenter();
        var counter = 0;
        jQuery.each(feature.properties.destinations, function(index, destination) {
          counter += 1;
          for (var id in destination) {
            var count = destination[id];
            var opacity = (count / featureMaxCount);
            var style = {
              fillColor: modeColor,
              fillOpacity: opacity
            };
            var destinationLayer = findOdFeatureById(id);
            if (destinationLayer) {
              destinationLayer.setStyle(style);
              if (counter < 10) {
                var line = L.polyline(
                  [destinationLayer.getBounds().getCenter(), selectedCentroid], {
                    color: 'white',
                    weight: 2,
                    opacity: 1
                  }
                );
                line.addTo(lines);
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
        modeMaxCount = modeData.properties.maxCount;
        totalModeCount = modeData.properties.totalCount;
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
        setInitialStyle();
        colorLegend(modeColor);
        legend.find('.current-count').html(modeMaxCount);
        jQuery.ajax({
          type: "POST",
          url: "/activate_polygon",
          data: {
            active_mode: activeMode,
            active_mode_name: activeModeName,
            active_polygon: activePolygonId,
          },
        })
        if (activePolygonId) {
          var activePolygon = findOdFeatureById(activePolygonId)
          activePolygon.feature.clickEvent();
        }
      });

      jQuery('.od-mode-selector').first().click();
    };

    makeODMap('od-map', window.data.od_relations, window.data);

    var polygonModalSplit = function(polygonId) {
      var modalSplit = jQuery.map(window.data.od_relations, function(modeData, mode) {
        var _data = [];
        jQuery.each(modeData.features, function(id, feature) {
          if (mode !== 'all' && polygonId == feature.id) {
            _data.push({
              mode: mode,
              share: feature.properties.featureStarts,
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
  });
});