# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
# Prevent database truncation if the environment is production
abort("The Rails environment is running in production mode!") if Rails.env.production?
require 'spec_helper'
require 'rspec/rails'
require 'capybara/poltergeist'
require 'factories'

ActiveRecord::Migration.maintain_test_schema!

Capybara.register_driver :poltergeist do |app|
  Capybara::Poltergeist::Driver.new(app, js_errors: true)
end

Capybara.javascript_driver = :poltergeist

RSpec.configure do |config|
  config.include FactoryGirl::Syntax::Methods

  config.use_transactional_fixtures = false

  config.before(:each, js: true) do
    Capybara.page.driver.browser.resize(1600, 1000)
  end

  config.before(:suite) do
    DatabaseCleaner.clean
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each, no_transaction: true) do
    DatabaseCleaner.strategy = :truncation, {except: %w[spatial_ref_sys]}
  end

  config.before(:each, js: true) do
    DatabaseCleaner.strategy = :truncation, {except: %w[spatial_ref_sys]}
  end

  config.before(:each) do
    DatabaseCleaner.start
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end

  config.before(:each, hard_cleanup: true) do
    # hack to empty tables since DatabaseCleaner refuses to do its job
    # in case of data inserted by Matsim
    DB[:scenarios].delete
    DB[:grids].delete
  end

  # Remove this line if you're not using ActiveRecord or ActiveRecord fixtures
  config.fixture_path = "#{::Rails.root}/spec/fixtures"

  # RSpec Rails can automatically mix in different behaviours to your tests
  # based on their file location, for example enabling you to call `get` and
  # `post` in specs under `spec/controllers`.
  #
  # You can disable this behaviour by removing the line below, and instead
  # explicitly tag your specs with their type, e.g.:
  #
  #     RSpec.describe UsersController, :type => :controller do
  #       # ...
  #     end
  #
  # The different available types are documented in the features, such as in
  # https://relishapp.com/rspec/rspec-rails/docs
  config.infer_spec_type_from_file_location!

  # Filter lines from Rails gems in backtraces.
  config.filter_rails_from_backtrace!
  # arbitrary gems may also be filtered via:
  # config.filter_gems_from_backtrace("gem name")
end

def login
  @user = create(:user)
  visit root_path
  find('.open-login-modal').trigger('click')
  sleep(0.5)
  fill_in('Email', with: 'user@test.com')
  fill_in('Password', with: 'secret')
  find('.btn', text: 'LOG IN').trigger('click')
  sleep(0.5)
end
