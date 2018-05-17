require 'rails_helper'
require 'rake'

RSpec.describe MatsimStarter, type: :model do
  district_id = '11000'
  year = 2017
  scenario_name = 'Seed'

  describe '#run_matsim' do
    it 'creates a scenario', :hard_cleanup do
      expect(Scenario.all.count).to eq 0
      expect(Grid.all.count).to eq 0
      described_class.new(district_id, year, scenario_name)
      expect(Scenario.all.count).to eq 1
      expect(Grid.all.count).to eq 775
    end
  end

  # rubocop:disable LineLength
  describe '#calculate_stats' do
    it 'raises runtime error if matsim does not create scenario' do
      error = 'Matsim scenario creation not completed. User \'matsim\' existing? Look into matsim logfiles for more information.'
      expect { described_class.new(nil, 2017, scenario_name) }.to raise_error(RuntimeError.new(error).backtrace)
    end
  end
end
