class User < ApplicationRecord
  has_secure_password

  email_regexp = /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i
  validates :email, presence: true, format: { with: email_regexp }, uniqueness: true
end
