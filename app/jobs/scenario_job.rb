class ScenarioJob < ApplicationJob
  queue_as :high_priority

  def perform(district_id, year)
    MatsimStarter.new(district_id, year)
    if scenario = Scenario.find_by(year: year, district_id: district_id)
      scenario.calculate_od_relations_and_modal_split
    else
      raise 'Matsim scenario creation not completed. Look into matsim logfiles for more information.'
    end
  end
end
