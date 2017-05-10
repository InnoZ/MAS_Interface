class Scenario < ApplicationRecord
  validates :district_id, presence: true, numericality: { only_integer: true }
  validates :year, presence: true, numericality: { only_integer: true }

  def district_name
    DistrictsGermany.list.find { |d| d[1] == district_id }[0]
  end

  def number_of_agents
    JSON.parse(json)['features'].length
  end
end
