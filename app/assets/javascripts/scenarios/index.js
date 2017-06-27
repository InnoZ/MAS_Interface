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

    map = L.map('map-germany', {
      maxZoom: 9,
      minZoom: 7,
    });

    L.tileLayer('//{s}.tiles.mapbox.com/v3/innoz-developer.h1ma7egc/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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
      'weight': 0.2,
      'fillColor': 'steelblue',
      'fillOpacity': 0.1,
    };

    var highlightedStyle = {
      'color': '#283645',
      'opacity': 0.8,
      'weight': 0.2,
      'fillColor': 'steelblue',
      'fillOpacity': 0.5,
    };

    var featureById = {};
    var onEachFeature = function (feature, layer) {
      var id = feature.properties.id;

      // Keep track of highlighted marker
      if (id) { featureById[id] = layer };

      if ( window.availableDistricts.includes(id) ) {
        layer.setStyle(highlightedStyle);
      } else {
        layer.setStyle(defaultStyle);
      };

      var name = feature.properties.name;
      function onclick(e) {
        var id = feature.properties.id;
        highlightLayer(id);
        if ( window.availableDistricts.includes(id) ) {
          window.location.href = '/show/' + id;
        } else {
          alert('Für diesen Kreis wurden noch keine Szenarien berechnet.');
        };
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

    var highlightLayer = function(id) {
      removeHighlight();
      highlightedLayer = featureById[id];
      highlightedLayer.setStyle({'weight': 3});
      map.fitBounds(highlightedLayer.getBounds());
      jQuery('#district-input').val(highlightedLayer.feature.properties.name);
    };

    new Awesomplete('#district-input', {
      list: districtsGermanyList,
      replace: function(input) {
        this.input.value = input.label;
        highlightLayer(input.value);
      }
    });
  });
});
