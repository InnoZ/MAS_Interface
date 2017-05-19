class Scenario < ApplicationRecord
  validates :district_id, presence: true
  validates :year, presence: true, numericality: { only_integer: true }

  def district_name
    DistrictsGermany.name(district_id)
  end

  def district_geometry
    DistrictsGermany.geometry(district_id)
  end

  def modal_split
    parse_json(statistics)
  end

  def agent_features
    parse_json(agents).fetch('features').map do |a|
      name = a.fetch('properties').fetch('person_id')
      mode = a.fetch('properties').fetch('mode')
      "#{name} | #{mode}"
    end
  end

  def parse_json(json)
    JSON.parse(json)
  rescue JSON::ParserError
    return 'no valid json'
  end

  def seed_text
    return 'Ein vorberechnetes Szenario aus den Seeds' if seed

    'Ein neu generiertes Szenario'
  end

  # pretotyp
  def traffic_performance
    File.read(Rails.root.join('tmp/pretotyp/traffic_performance.json'))
  end

  # pretotyp
  def diurnal_curve
    File.read(Rails.root.join('tmp/pretotyp/diurnal_curve.json'))
  end

  # pretotyp
  def boxplot
    File.read(Rails.root.join('tmp/pretotyp/boxplot.json'))
  end
end
