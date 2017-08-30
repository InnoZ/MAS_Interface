# dump location gisdata/MODELLINGDATA/seeds.dump
# place the seeds.dump at db/seeds
# createdb mas_interface_development
# bundle exec rake db:gis:setup
# bundle exec rake db:migrate
# bundle exec rake db:seed

SEED_PATH = Rails.root.join('db', 'seeds')

if File.file?("#{SEED_PATH}/seeds.dump")
  puts 'loading dump with scenarios and agent plans...'
  Kernel.system "psql mas_interface_#{Rails.env} < #{SEED_PATH}/seeds.dump"

  # create grids
  Scenario.where(seed: true).each do |scenario|
    puts "calculating OD relations for district #{scenario.district_id} | #{scenario.year}"
    scenario.calculate_od_relations_and_modal_split
  end
end

random_district_ids = DistrictsGermany.list.map { |d| d[1] }.sample(10)
random_district_ids.each do |id|
  puts "enqueue scenario #{id} || 2017"
  ScenarioJob.perform_later(id, 2017)
  puts "enqueue scenario #{id} || 2030"
  ScenarioJob.perform_later(id, 2030)
end

User.create(
  email: 'user@test.com',
  password: 'secret'
)
