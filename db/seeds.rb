# dump location gisdata/MODELLINGDATA/seeds.dump
# place the seeds.dump at db/seeds
# createdb mas_interface_development
# bundle exec rake db:gis:setup
# bundle exec rake db:migrate
# bundle exec rake db:seed

SEED_PATH = Rails.root.join('db', 'seeds')
DISTRICT_IDS = %w[09180 03404]

if File.file?("#{SEED_PATH}/seeds.dump")
  puts 'loading dump with scenarios and agent plans...'
  Kernel.system "psql mas_interface_#{Rails.env} < #{SEED_PATH}/seeds.dump"

  # create grids
  DISTRICT_IDS.each do |district_id|
    scenario = Scenario.find_by(district_id: district_id, seed: true)
    if scenario.od_relations
      puts "OD relations for District ID: #{district_id} already calculated"
      next
    end
    puts "calculating OD relations for District ID: #{district_id}"
    scenario.calculate_od_relations
  end
end

random_district_ids = DistrictsGermany.list.map { |d| d[1] }.sample(10)
random_district_ids.each do |id|
  puts "makes scenario #{id} || 2017"
  Scenario.make(district_id: id, year: 2017)
  puts "makes scenario #{id} || 2030"
  Scenario.make(district_id: id, year: 2030)
end
