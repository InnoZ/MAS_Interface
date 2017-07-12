jQuery(function() {
  jQuery('#map-germany').each(function() {
    var resizeMap = function() {
      var mapHeight = jQuery(window).height() - jQuery('header').height();
      jQuery('#map-germany').height(mapHeight);
    };
    resizeMap();
    jQuery(window).resize(function() {
      // delay for browser minimizing/maximizing
      setTimeout(function() { resizeMap(); map.invalidateSize(); }, 100);
    });
    jQuery('.navbar-collapse').on('shown.bs.collapse', function() { resizeMap(); });
    jQuery('.navbar-collapse').on('hidden.bs.collapse', function() { resizeMap(); });

    L.mapbox.accessToken = 'pk.eyJ1IjoiaW5ub3otZGV2ZWxvcGVyIiwiYSI6IkRJLTdMWVkifQ.-P3v2RPr4HMr3JfNMxAsgQ';

    map = L.mapbox.map('map-germany', 'innoz-developer.mj43ge61', {
      maxZoom: 9,
      minZoom: 7,
      zoomControl: false,
    });

    // map = L.map('map-germany', {
    //   maxZoom: 9,
    //   minZoom: 7,
    // });
    //
    // L.tileLayer('//{s}.tiles.mapbox.com/v3/innoz-developer.h1ma7egc/{z}/{x}/{y}.png', {
    //   attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map);

    // place zoom control to topright
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // place metric scale to bottomright
    L.control.scale({
      position: 'bottomright',
      imperial: false
    }).addTo(map);

    // Variable to keep track of highlighted marker
    var highlightedLayer = null;
    // Function for removing highlight
    function removeHighlight() {
      if (highlightedLayer !== null) {
        highlightedLayer.setStyle({'weight': 0.2});
        highlightedLayer = null;
      }
    }

    var defaultStyle = {
      'color': '#283645',
      'opacity': 0.8,
      'weight': 0.4,
      'fillColor': '#3F8DBF',
      'fillOpacity': 0.4,
    };

    var highlightedStyle = {
      'color': '#283645',
      'opacity': 0.8,
      'weight': 0.4,
      'fillColor': '#3F8DBF',
      'fillOpacity': 0.6,
    };

    var featureById = {};
    var onEachFeature = function (feature, layer) {
      var id = feature.properties.id;

      // Keep track of highlighted marker
      if (id) { featureById[id] = layer };

      if ( window.availableDistricts.indexOf(id) != -1 ) {
        layer.setStyle(highlightedStyle);
      } else {
        layer.setStyle(defaultStyle);
      };

      var name = feature.properties.name;
      function onclick(e) {
        var id = feature.properties.id;
        highlightLayer(id, false);
      };
      layer.on('click', onclick);
    };

    var districts = L.geoJson(window.districtsGermanyGeo, { onEachFeature: onEachFeature });
    districts.addTo(map);

    var startPositions = [
      [51.467696956223364, 10.294189453125],
      [52.80608223985886, 10.52490234375],
      [50.48547354578499, 9.3548583984375],
    ];
    var randomPosition = startPositions[Math.floor(Math.random()*startPositions.length)];
    map.setView(randomPosition, 8);

    jQuery('.scenario-selection-form')
      .on('mouseover', function() {
        map.scrollWheelZoom.disable();
        map.dragging.disable();
      })
      .on('mouseout', function() {
        map.scrollWheelZoom.enable();
        map.dragging.enable();
      });

    var highlightLayer = function(id, zoomTo) {
      removeHighlight();
      highlightedLayer = featureById[id];
      highlightedLayer.setStyle({'weight': 3});
      jQuery('#district-input').val(highlightedLayer.feature.properties.name);
      if (zoomTo) {
        map.fitBounds(highlightedLayer.getBounds());
      };
      if ( window.availableDistricts.indexOf(id) != -1 ) {
        var link = 'show/' + id;
        jQuery('.district-info-box').html(
          '<a class="btn btn-default" href=' + link + '>show scenario</a>'
        ).click(function() { jQuery('.loading-overlay').show() });
      } else {
        jQuery('.district-info-box').html('Für diesen Kreis wurden noch keine Szenarien berechnet.');
      };
    };

    new Awesomplete('#district-input', {
      list: districtsGermanyList,
      replace: function(input) {
        this.input.value = input.label;
        highlightLayer(input.value, true);
      }
    });

    setTimeout(function() {
      jQuery('.scenario-selection-container').show();
    }, 1);
  });
});
