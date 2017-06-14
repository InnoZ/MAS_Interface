require 'rails_helper'

RSpec.describe Scenario, type: :model do
  let(:scenario) do
    described_class.new(
      district_id: '03404',
      year: 2017,
      seed: false
    )
  end

  describe '#seed_text' do
    it 'returns a string' do
      expect(scenario.seed_text).to eq('Ein neu generiertes Szenario')
    end
  end

  describe 'creation' do
    let(:district_id) { '03404' }
    let(:year) { 2017 }

    it 'is conducted by matsim' do
      MatsimStarter.new(district_id, year)
      new_scenario = Scenario.find_by(district_id: district_id, year: year)
      expect(new_scenario).to_not eq(nil)
    end
  end
end
