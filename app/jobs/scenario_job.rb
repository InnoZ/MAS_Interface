class ScenarioJob < ApplicationJob
  queue_as :high_priority

  def perform(district_id, year)
    MatsimStarter.new(district_id, year)
  end
end
