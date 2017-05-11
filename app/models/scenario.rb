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
    if valid_json?(statistics)
      JSON.parse(statistics)
    else
      'Keine Statistik vorhanden'
    end
  end

  def number_of_agents
    if valid_json?(agents)
      JSON.parse(agents).fetch('features').length
    else
      'Keine Agenten vorhanden'
    end
  end

  def valid_json?(json)
    JSON.parse(json)
    return true
  rescue JSON::ParserError => e
    return false
  end
end
