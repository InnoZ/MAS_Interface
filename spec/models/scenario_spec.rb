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
        'traffic_performance' =>
        [
          {
            'mode' => 'Carsharing',
            'color' => '#db8012',
            'traffic' => 3,
          },
          {
            'mode' => 'Walk',
            'color' => '#3db783',
            'traffic' => 4,
          },
        ]
      )
    end
  end

  describe '#carbon_emission' do
    it 'returns a hash with a specific format' do
      expect(scenario.carbon_emission).to eq(
        'carbon_emission' =>
        [
          {
            'mode' => 'Carsharing',
            'color' => '#db8012',
            'carbon' => 5,
          },
          {
            'mode' => 'Walk',
            'color' => '#3db783',
            'carbon' => 0,
          },
        ]
      )
    end
  end

  describe '.make' do
    let(:new_scenario) { Scenario.make(district_id: '03241', year: 2017) }

    it 'creates scenario and fills od_relations' do
      new_scenario.calculate_od_relations
      expect(new_scenario.od_relations).to_not eq(nil)
    end
  end
end
