require 'rails_helper'

RSpec.describe Scenario, type: :model do
  let(:scenario) do
    described_class.new(
      district_id: '03404',
      year: 2017,
      agents: '{"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"EPSG:4326"}},"features":[{"type":"Feature","geometry":{"type":"MultiLineString","coordinates":[[[100,100],[0.0,0.0]]]},"properties":{"person_id":"nigel","started_at":64800.0,"finished_at":68400.0,"mode":"carsharing","kmh":0},"id":"fid--72d593ca_15c15c27906_-7ffd"},{"type":"Feature","geometry":{"type":"MultiLineString","coordinates":[[[105,100],[100,100]]]},"properties":{"person_id":"nigel","started_at":52200.0,"finished_at":53100.0,"mode":"walk","kmh":0},"id":"fid--72d593ca_15c15c27906_-7ffe"},{"type":"Feature","geometry":{"type":"MultiLineString","coordinates":[[[100,100],[105,100]]]},"properties":{"person_id":"nigel","started_at":50400.0,"finished_at":50760.0,"mode":"walk","kmh":0},"id":"fid--72d593ca_15c15c27906_-7fff"},{"type":"Feature","geometry":{"type":"MultiLineString","coordinates":[[[0.0,0.0],[100,100]]]},"properties":{"person_id":"nigel","started_at":28800.0,"finished_at":32400.0,"mode":"pt","kmh":0},"id":"fid--72d593ca_15c15c27906_-8000"}]}',
      statistics: '{"modal_split": [{"mode": "car","share" : "56.91056910569105"},{"mode": "public transport","share" : "11.38211382113821"},{"mode": "walk","share" : "18.69918699186992"},{"mode": "bike","share" : "13.008130081300814"}]}',
      seed: false
    )
  end

  describe '#modal_split' do
    it 'parse scenario statistics' do
      expect(scenario.modal_split).to eq(JSON.parse(scenario.statistics))
    end
  end

  describe '#agent_features' do
    it 'returns name and mode' do
      expect(scenario.agent_features).to include('nigel | carsharing')
    end
  end

  describe '#parse_json' do
    it 'parses json' do
      expect(scenario.parse_json(scenario.agents)).to eq(JSON.parse(scenario.agents))
    end

    it 'returns a string if json is not valid' do
      expect(scenario.parse_json('{"broken": "json"')).to eq('no valid json')
    end
  end

  describe '#seed_text' do
    it 'returns a string' do
      expect(scenario.seed_text).to eq('Ein neu generiertes Szenario')
    end
  end
end
