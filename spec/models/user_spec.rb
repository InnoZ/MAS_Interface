require 'rails_helper'

RSpec.describe User, type: :model do
  subject do
    described_class.new(
      email: 'test@test.com',
      password: 'secret',
      password_confirmation: 'secret'
    )
  end

  describe 'validations' do
    it 'let pass with valid attributes' do
      expect(subject).to be_valid
    end

    it 'let not pass with non-complete attributes' do
      subject.email = nil
      expect(subject).to_not be_valid
    end

    it 'let not pass with wrong password confirmation' do
      subject.password_confirmation = 'mistyped'
      expect(subject).to_not be_valid
    end

    it 'let not pass with wrong password confirmation' do
      subject.password_confirmation = 'mistyped'
      expect(subject).to_not be_valid
    end

    it 'require email string' do
      subject.email = 'wrong_email_style.com'
      expect(subject).to_not be_valid
    end
  end
end
