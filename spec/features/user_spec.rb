require 'rails_helper'

feature 'Login' do
  before do
    @user = create(:user)
    visit root_path
    find('.open-login-modal').trigger('click')
    sleep(0.5)
    fill_in('Email', with: 'user@test.com')
  end

  scenario 'lets users logging in', js: true do
    fill_in('Password', with: 'secret')
    find('.btn', text: 'LOG IN').trigger('click')
    expect(page).to_not have_css('a', text: 'LOGIN')
    expect(page).to have_css('a', text: 'LOGOUT')
  end

  scenario 'lets users not log in with wrong password', js: true do
    fill_in('Password', with: 'wrong')
    find('.btn', text: 'LOG IN').trigger('click')
    expect(page).to_not have_css('a', text: 'LOGOUT')
    expect(page).to have_css('a', text: 'LOGIN')
  end
end
