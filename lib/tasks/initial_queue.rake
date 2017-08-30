namespace :initial_queue do
  desc 'start queue with all districts for 2017 and 2030'
  task start: :environment do
    all_district_ids = DistrictsGermany.list.map { |d| d[1] }
    all_district_ids.each do |id|
      [2017, 2030].each do |year|
        unless Scenario.find_by(district_id: id, year: year)
          ScenarioJob.set(queue: :low_priority).perform_later(id, year, 'Seed')
        end
      end
    end
  end
end
