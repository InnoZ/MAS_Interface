jQuery(function() {
  jQuery('#new').each(function() {
    new Awesomplete('#district-input', {
      list: districtsGermanyList,
      replace: function(input) {
        this.input.value = input.label;
        jQuery('.hidden-district-input').val(input.value).change();
      }
    });
  });
});
