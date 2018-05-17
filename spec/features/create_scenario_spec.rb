require 'rails_helper'

feature 'Create Scenario', js: true do
  scenario 'is not accessable without login', type: :routing do
    expect(get: 'scenarios/new').to_not be_routable
  end

  scenario 'is accessable with login' do
    login
    find('a', text: 'SCENARIO CREATOR').trigger('click')
    expect(page).to have_content('2017')
  end
end
