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
    let(:new_scenario) { Scenario.find_by(district_id: district_id, year: year) }

    before do
      MatsimStarter.new(district_id, year)
    end

    it 'is conducted by matsim' do
      expect(new_scenario).to_not eq(nil)
    end

    it 'fills od_relations' do
      new_scenario.calculate_od_relations
      expect(new_scenario.od_relations).to_not eq(nil)
    end
  end
end
