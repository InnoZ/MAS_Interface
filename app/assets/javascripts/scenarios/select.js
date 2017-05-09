jQuery(function() {
  map = L.map('map-germany', {
    maxZoom: 8,
    minZoom: 6,
  });

  L.geoJson(window.germany_simple)
    .addTo(map)
    .setStyle({fillColor: '#337ab7', fillOpacity: 1, stroke: false})

  var onEachFeature = function (feature, layer) {
    var name = feature.properties.name;
    layer.setStyle({fillColor: '#506A85'});
    function mouseover(e) {
      layer.setStyle({fillOpacity: 0.2});
      jQuery('.district-name').html(feature.properties.name);
    };
    function mouseout(e) {
      layer.setStyle({fillOpacity: 1});
      jQuery('.district-name').html('');
    };
    function onclick(e) {
      jQuery('#district_id').val(feature.properties.id);
    };
    layer.on('mouseout', mouseout);
    layer.on('mouseover', mouseover);
    layer.on('click', onclick);
  };

  var districts = L.geoJson(window.districts_germany, {onEachFeature: onEachFeature});
  districts.addTo(map);
  districts.setStyle({fillOpacity: 1, weight: 0.5, color: 'black'});

  map.fitBounds(districts.getBounds());

  jQuery(window).mousemove(function(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
    jQuery('.district-name').css({
      'top': mouseY,
      'left': mouseX,
    });
  });
});
