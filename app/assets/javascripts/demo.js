//= require leaflet

jQuery(function() {
  //------------------ MONITOR -------------------------//
  jQuery('#demo-monitor').each(function() {
    window.map = L.map('demo-monitor-map', {
      zoomControl: false,
      scrollWheelZoom: false,
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

    // ActionCable Websocket
    var starts = null;
    var labels = null;
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

        console.log(response)
        if (response.active_polygon == '') {
          jQuery('#feature-starts').hide();
          if (starts) { map.removeLayer(starts) };
          if (labels) { map.removeLayer(labels) };
          zoomToOsna();
          console.log('no polygon clicked yet')
        } else {
          var feature = featureById[parseInt(response.active_polygon)];
          var featureStarts = feature.feature.properties.featureStarts;
          jQuery('#feature-starts').show().html('Fahrten von hier: ' + featureStarts).css('color', color);
          var startPoints = feature.feature.properties.start_points;
          if (starts) { map.removeLayer(starts) };
          if (labels) { map.removeLayer(labels) };

          starts = L.featureGroup();
          labels = L.featureGroup();
          jQuery.each(startPoints, function(index, elem) {
            var point = [elem[0][1], elem[0][0]];
            var activity = elem[1];
            var start = L.circle(point, 33, {
              fill: true,
              fillOpacity: 0.5,
              weight: 0,
              fillColor: color,
            });
            start.addTo(starts);
            starts.addTo(map);

            var label = L.tooltip({
                permanent: true,
                direction: 'center',
                className: 'text'
            }).setContent(activity[0]).setLatLng(point);
            label.addTo(labels);
            labels.addTo(map);
          });
          map.setView(feature.getBounds().getCenter(), 15);
        };
      }
    });
  });

  //------------------ TOUCH -------------------------//
  jQuery('#demo-touch').each(function() {
    var makeODMap = function(div, odRelations, data) {
      var map, modeMaxCount, activeMode, activeModeName, modeData, modeColor, totalModeCount, selectedLayer, lines, odLayer;

      var legend = jQuery('#' + div).prev('.legend');

      var resizeMap = function() {
        var mapHeight = jQuery(window).height() - jQuery('header').height() - 100;
        jQuery('#' + div).height(mapHeight);
      };
      resizeMap();
      jQuery(window).resize(function() {
        // delay for browser minimizing/maximizing
        setTimeout(function() {
          resizeMap();
          map.invalidateSize();
        }, 100);
      });
      jQuery('.navbar-collapse').on('shown.bs.collapse', function() {
        resizeMap();
      });
      jQuery('.navbar-collapse').on('hidden.bs.collapse', function() {
        resizeMap();
      });

      map = L.map(div, {
        tap: true,
        tapTolerance: 80
      });

      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();

      var district = L.geoJson(data.district_geometry);
      district.setStyle({
        fillOpacity: 0,
        stroke: true,
        color: 'red'
      });
      district.addTo(map);
      map.fitBounds(district.getBounds());

      var colorLegend = function(color) {
        var gradient = 'white 0%, ' + color + ' 100%';
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
        layer.on('click', function(e) {
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

          jQuery.ajax({
            type: "POST",
            url: "/activate_polygon",
            data: {
              active_mode: activeMode,
              active_mode_name: activeModeName,
              active_polygon: feature.id
            },
          })

          featureSelected = true;
        });
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
        legend.find('.total-count').html(I18n.total + ": " + feature.properties.featureStarts)
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
        legend.find('.total-count').html(I18n.total + ": " + totalModeCount);
        legend.find('.current-count').html(modeMaxCount);
        jQuery.ajax({
          type: "POST",
          url: "/activate_polygon",
          data: {
            active_mode: activeMode,
            active_mode_name: activeModeName,
            active_polygon: null,
          },
        })
      });

      jQuery('.od-mode-selector').last().click();
    };

    makeODMap('od-map', window.data.od_relations, window.data);
  });
});