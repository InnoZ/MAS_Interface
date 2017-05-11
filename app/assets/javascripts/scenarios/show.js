jQuery(function() {
  jQuery('#district-geometry').each(function() {
    staticDistrictMap('district-geometry', window.districtGeometry);
  });

  jQuery('#modal-split-chart').each(function() {
    nv.addGraph(function() {
      var chart = nv.models.pieChart()
        .x(function(d) { return d.mode })
        .y(function(d) { return d.share })
        .showLabels(true)
        .labelType("percent")
        .showLegend(true)

      d3.select('#modal-split-chart')
        .datum(modalSplit.modal_split)
        .transition().duration(350)
        .call(chart);
      return chart;
    });
  });
});
