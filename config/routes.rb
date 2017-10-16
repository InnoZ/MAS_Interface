require 'routing/constraints'

Rails.application.routes.draw do
  require 'sidekiq/web'
  mount Sidekiq::Web => '/queue', constraints: UserConstraint.new

  scope '(:locale)', locale: /de|en/ do
    get '' => 'pages#index', as: :root

    get 'creator', to: 'pages#creator', as: :creator
    get 'about', to: 'pages#about', as: :about
    get 'contact', to: 'pages#contact', as: :contact
    get 'imprint', to: 'pages#imprint', as: :imprint
    get 'privacy', to: 'pages#privacy', as: :privacy

    resources :scenarios, except: %i[show new]
    get 'show/:district(/:year_a)(/:year_b)', to: 'scenarios#show', as: :show_district
    get 'scenarios/new', to: 'scenarios#new', as: :new_scenario, constraints: UserConstraint.new

    post '/login', to: 'sessions#create'
    get '/logout', to: 'sessions#destroy'
  end
end
