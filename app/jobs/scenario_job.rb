class ScenarioJob < ApplicationJob
  queue_as :high_priority

  def perform(district_id, year, name)
    MatsimStarter.new(district_id, year, name)
  end
end
