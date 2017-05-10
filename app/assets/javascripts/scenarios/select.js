jQuery(function() {
  jQuery('#map-germany').each(function() {
    map = L.map('map-germany', {
      maxZoom: 8,
      minZoom: 6,
    });

    var boundaryLayer = L.tileLayer('http://korona.geog.uni-heidelberg.de/tiles/adminb/x={x}&y={y}&z={z}');
    boundaryLayer.addTo(map);

    var onEachFeature = function (feature, layer) {
      var name = feature.properties.name;
      layer.setStyle({fillColor: 'orange'});
      function mouseover(e) {
        layer.setStyle({fillOpacity: 0.2});
      };
      function mouseout(e) {
        layer.setStyle({fillOpacity: 0.1});
      };
      function onclick(e) {
        jQuery('#scenario_district_id').val(feature.properties.id);
      };
      layer.on('mouseout', mouseout);
      layer.on('mouseover', mouseover);
      layer.on('click', onclick);
    };

    var districts = L.geoJson(window.districts_germany, {onEachFeature: onEachFeature});
    districts.addTo(map);
    districts.setStyle({fillOpacity: 0.1, weight: 0});

    var startPositions = [
      [51.467696956223364, 10.294189453125],
      [52.80608223985886, 10.52490234375],
      [50.48547354578499, 9.3548583984375],
    ];
    var randomPosition = startPositions[Math.floor(Math.random()*startPositions.length)];
    map.setView(randomPosition, 8);
  });
});
