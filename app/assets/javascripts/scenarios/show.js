jQuery(function() {
  jQuery('#district-geometry').each(function() {
    map = L.map('district-geometry', { zoomControl:false });
    var district = L.geoJson(window.districtGeometry);
    district.addTo(map);
    district.setStyle({fillOpacity: 1, fillColor:'#3F8DBF', weight: 0});
    map.fitBounds(district.getBounds());

    // let map appear like static graphic
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if (map.tap) map.tap.disable();
    jQuery('#district-geometry').css('cursor', 'default');
    jQuery('.leaflet-clickable').css('cursor', 'default');
  });
});
