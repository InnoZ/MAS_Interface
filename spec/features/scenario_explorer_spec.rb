require 'rails_helper'

feature 'Scenario Explorer', js: true do
  before do
    visit '/'
    click_on 'Scenario Explorer'
  end

  scenario 'Visit index page and see german text' do
    sleep(1)
    screenshot_and_open_image
  end
end
