// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.

//= require jquery
//= require jquery_ujs
//= require jquery.easing.1.3.min
//= require jquery.form
//= require jquery.validate.min
//= require jquery-ui
//= require bootstrap.min
//= require aos
//= require owl.carousel.min
//= require jquery.isotope.min
//= require imagesloaded.pkgd.min
//= require jquery.easytabs.min
//= require viewport-units-buggyfill
//= require template_scripts
//= require mapbox
//= require awesomplete
//= require d3.v3
//= require nv.d3
//= require_self
//= require_tree

jQuery(function() {
  jQuery('#contact-map').each(function() {
    L.mapbox.accessToken = 'pk.eyJ1IjoiaW5ub3otZGV2ZWxvcGVyIiwiYSI6IkRJLTdMWVkifQ.-P3v2RPr4HMr3JfNMxAsgQ';
    map = L.mapbox.map('contact-map', 'innoz-developer.mj43ge61', {
      maxZoom: 16,
      minZoom: 7,
      scrollWheelZoom: false,
      touchZoom: false,
    });
    var innozCoordinates = [52.481991, 13.357194];
    map.setView(innozCoordinates, 12);
    var marker = L.marker(innozCoordinates).addTo(map).bindPopup("<a href='http://www.innoz.de'>Innovationszentrum für Mobilität und gesellschaftlichen Wandel GmbH</a>");
  });

  staticDistrictMap = function(divId, json, color)  {
    map = L.map(divId, { zoomControl:false });
    var district = L.geoJson(json);
    district.addTo(map);
    district.setStyle({fillOpacity: 1, fillColor: color, weight: 0});
    map.fitBounds(district.getBounds());

    // let map appear like static graphic
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if (map.tap) map.tap.disable();
    jQuery(divId).css('cursor', 'default');
  };

  // fade out flash messages after a while
  jQuery('.flash-message').delay(3000).fadeOut(400);
});
