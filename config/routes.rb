Rails.application.routes.draw do
  scope '(:locale)', locale: /de|en/ do
    get '' => 'pages#index', as: :root

    get 'about', to: 'pages#about', as: :about
    get 'contact', to: 'pages#contact', as: :contact
    get 'imprint', to: 'pages#imprint', as: :imprint
    get 'privacy', to: 'pages#privacy', as: :privacy

    resources :scenarios
  end
end
