require 'rails_helper'
require 'rake'

RSpec.describe MatsimStarter, type: :model do

  let(:district_id) { '11000' }
  let(:year) { 2017 }
  let(:scenario) { Scenario.find_by({district_id: district_id, year: year}) }

  it 'creates a scenario', :hard_cleanup do
    expect(Scenario.all.count).to eq 0
    expect(Grid.all.count).to eq 0
    described_class.new(district_id, year)
    scenario.calculate_od_relations_and_modal_split
    expect(Scenario.all.count).to eq 1
    expect(Grid.all.count).to eq 775
  end
end
