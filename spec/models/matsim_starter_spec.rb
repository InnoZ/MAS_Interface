require 'rails_helper'
require 'rake'

RSpec.describe MatsimStarter, type: :model do
  let(:district_id) { '11000' }
  let(:year) { 2017 }
  let(:scenario) { Scenario.find_by(district_id: district_id, year: year) }

  it 'creates a scenario', :hard_cleanup do
    expect(Scenario.all.count).to eq 0
    expect(Grid.all.count).to eq 0
    described_class.new(district_id, year)
    expect(Scenario.all.count).to eq 1
    expect(Grid.all.count).to eq 775
  end

  it 'raises runtime error if matsim does not create scenario' do
    error = 'Matsim scenario creation not completed. Look into matsim logfiles for more information.'
    expect { described_class.new(nil, 2017) }.to raise_error(RuntimeError, error)
  end
end
