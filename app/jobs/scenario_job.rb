class ScenarioJob < ApplicationJob
  queue_as :high_priority

  def perform(district_id, year)
    MatsimStarter.new(district_id, year)
    Scenario
      .find_by(year: year, district_id: district_id)
      .calculate_od_relations
  end
end
