require 'rails_helper'

feature 'Scenario Explorer', js: true do
  before do
    district_id = DistrictsGermany.feature_by_name('Köln')['properties']['id']
    MatsimStarter.new(district_id, 2017)
    scenario = Scenario.find_by({district_id: district_id, year: 2017})
    scenario.calculate_od_relations_and_modal_split
    visit 'scenarios'
  end

  scenario 'click on district with scenario', hard_cleanup: true do
    find_all('.leaflet-clickable')[10].trigger('click')
    sleep(0.5)
    expect(page).to have_content 'Köln'
  end

  scenario 'click on district without scenario', hard_cleanup: true do
    find_all('.leaflet-clickable')[11].trigger('click')
    sleep(0.5)
    expect(page).to_not have_content 'Köln'
    expect(page).to have_content 'Fürstenfeldbruck'
  end
end
