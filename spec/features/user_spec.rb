require 'rails_helper'

feature 'Login', js: true do
  before do
    create :user
  end

  scenario 'lets users logging in' do
    visit root_path
    find('.open-login-modal').trigger('click')
    sleep(0.5)
    fill_in('Email', with: 'user@test.com')
    fill_in('Password', with: 'secret')
    find('.btn', text: 'LOG IN').trigger('click')
    expect(page).to have_content('logout')
  end
end
