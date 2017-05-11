jQuery(function() {
  jQuery('.index-district-map').each(function() {
    var district_id = jQuery(this).attr('district_id');
    var districts = window.districts_germany['features'];
    var geojson;
    jQuery.each(districts, function(id, feature) {
      if ( feature['properties']['id'] == district_id ) {
        geoJson = feature;
        return false;
      }
    });
    staticDistrictMap(jQuery(this).attr('id'), geoJson, '#3F8DBF');
  });
});
