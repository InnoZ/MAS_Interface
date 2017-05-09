Rails.application.routes.draw do
  root 'pages#index'

  get 'about', to: 'pages#about', as: :about
  get 'contact', to: 'pages#contact', as: :contact
  get 'imprint', to: 'pages#imprint', as: :imprint
  get 'privacy', to: 'pages#privacy', as: :privacy

  get 'select_scenario', to: 'scenarios#select', as: :select_scenario
  post 'run_scenario', to: 'scenarios#run', as: :run_scenario
end
