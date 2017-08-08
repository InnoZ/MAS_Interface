require 'rails_helper'

feature 'Create Scenario', js: true do
  scenario 'is not accessable without login', type: :routing do
    expect(get: 'scenarios/new').to_not be_routable
  end

  scenario 'is accessable with login', type: :routing do
    create :user
    login
    expect(get: 'scenarios/new').to be_routable
  end
end
