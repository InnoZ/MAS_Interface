require 'rails_helper'

RSpec.describe Scenario, type: :model do
  let(:scenario) do
    described_class.new(
      district_id: '03404',
      year: 2017,
      population: 1,
      population_diff_2017: 0,
      trips: 'none',
      diurnal_curve: 'none',
      person_km: [%w[carsharing 3.50], %w[walk 4.50]],
      carbon_emissions: [%w[carsharing 5], %w[walk 0.0]],
      seed: false
    )
  end

  describe '#calculate_od_relations_and_modal_split' do
    it 'inserts something into od_relations and modal_split' do
      scenario.calculate_od_relations_and_modal_split
      # hashs are empty, because mocked scenario has no agent plans
      expect(scenario.od_relations).to eq('{}')
      expect(scenario.modal_split).to eq('[]')
    end
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
            'mode' => 'carsharing',
            'color' => '#db8012',
            'traffic' => 3,
          },
          {
            'mode' => 'walk',
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
        [
          {
            'mode' => 'carsharing',
            'color' => '#db8012',
            'carbon' => 5,
          },
          {
            'mode' => 'walk',
            'color' => '#3db783',
            'carbon' => 0,
          },
        ]
      )
    end
  end
end
