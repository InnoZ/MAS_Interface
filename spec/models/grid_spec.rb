require 'rails_helper'

RSpec.describe Grid, type: :model do
  let(:grid) { described_class }

  describe '.default_side_length' do
    it 'has a default side length' do
      expect(grid.default_side_length).to eq(1_000)
    end
  end
end
