jQuery(function() {
  jQuery('#district-geometry').each(function() {
    map = L.map('district-geometry');
    var district = L.geoJson(window.districtGeometry);
    district.addTo(map);
    district.setStyle({fillOpacity: 1, weight: 0});
    map.fitBounds(district.getBounds());
  });
});
