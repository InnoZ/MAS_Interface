require 'rails_helper'

feature 'Language switch', js: true do
  before do
    visit '/'
  end

  scenario 'Visit index page and see german text' do
    expect(page).not_to have_content('LEARN MORE')
    expect(page).to have_content('KONTAKT')
    expect(page).to have_content('Impressum')
  end

  scenario 'Switch to english version and see english text' do
    find('a', text: 'english').trigger('click')
    expect(page).not_to have_content('MEHR ERFAHREN')
    expect(page).to have_content('CONTACT')
    expect(page).to have_content('Imprint')
  end

  scenario 'Click on link and see the same language' do
    find('a', text: 'english').trigger('click')
    find('a', text: 'Contact').trigger('click')
    expect(page).to have_content('Get in touch')
    expect(page).to_not have_content('Kontaktieren Sie uns')
  end
end
