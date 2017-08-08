namespace :initial_queue do
  desc 'start queue with all districts for 2017 and 2030'
  task start: :environment do
    all_district_ids = DistrictsGermany.list.map { |d| d[1] }
    all_district_ids.each do |id|
      ScenarioJob.set(queue: :low_priority).perform_later(id, 2017)
      ScenarioJob.set(queue: :low_priority).perform_later(id, 2030)
    end
  end
end
