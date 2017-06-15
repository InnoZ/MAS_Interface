require 'rails_helper'

RSpec.describe Scenario, type: :model do
  let(:scenario) do
    described_class.new(
      district_id: '03404',
      year: 2017,
      person_km: [%w[carsharing 3.50], %w[walk 4.50]],
      carbon_emissions: [%w[carsharing 5], %w[walk 0.0]],
      seed: false
    )
  end

  describe '#seed_text' do
    it 'returns a string' do
      expect(scenario.seed_text).to eq('Ein neu generiertes Szenario')
    end
  end

  describe '#traffic_performance' do
    it 'returns a hash with a specific format' do
      expect(scenario.traffic_performance).to eq(
        [
          {
            'key' => 'traffic_performance',
            'values' =>
              [
                {
                  'mode' => 'Carsharing', 'color' => '#E9B100', 'traffic_performance' => '3.50'
                },
                {
                  'mode' => 'Walk', 'color' => '#CEC11D', 'traffic_performance' => '4.50'
                },
              ],
          },
        ]
      )
    end
  end

  describe '#carbon_emission' do
    it 'returns a hash with a specific format' do
      expect(scenario.carbon_emission).to eq(
        [
          {
            'key' => 'carbon_emission',
            'values' =>
              [
                {
                  'mode' => 'Carsharing', 'color' => '#E9B100', 'carbon_emission' => '5.0'
                },
                {
                  'mode' => 'Walk', 'color' => '#CEC11D', 'carbon_emission' => '0.0'
                },
              ],
          },
        ]
      )
    end
  end

  describe 'creation' do
    let(:district_id) { '03241' }
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
