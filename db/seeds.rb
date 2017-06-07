# dump location gisdata/MODELLINGDATA/seeds.dump
# place the seeds.dump at db/seeds
# createdb mas_interface_development
# bundle exec rake db:gis:setup
# bundle exec rake db:migrate
# bundle exec rake db:seed

SEED_PATH = Rails.root.join('db', 'seeds')
DISTRICT_IDS = %w[09180 03404]

if File.file?("#{SEED_PATH}/seeds.dump")
  Kernel.system "psql mas_interface_development < #{SEED_PATH}/seeds.dump"

  # create osnabrueck 3connect scenario
  Scenario.create(
    district_id: '03404',
    year: 2017,
    population: 20_000,
    population_diff_2017: 5_000,
    person_km: [ ['carsharing', '15'], ['car', '50'] ],
    trips: [ ['car', '10'], ['carsharing', '15'] ],
    diurnal_curve: [ ['bike', '10', '5'], ['ride', '14', '7'] ],
    carbon_emissions: [ ['ride', '20'], ['car', '100'] ],
    seed: true
  )

  # create garmisch-partenkirchen egap scenario
  Scenario.create(
    district_id: '09180',
    year: 2016,
    population: 20_000,
    population_diff_2017: 5_000,
    person_km: [ ['carsharing', '15'], ['car', '50'] ],
    trips: [ ['car', '10'], ['carsharing', '15'] ],
    diurnal_curve: [ ['bike', '10', '5'], ['ride', '14', '7'] ],
    carbon_emissions: [ ['ride', '20'], ['car', '100'] ],
    seed: true
  )

  # create grids
  DISTRICT_IDS.each do |district_id|
    if Scenario.find_by(district_id: district_id, seed: true)
      GridFill.new(scenario: Scenario.find_by(district_id: district_id, seed: true), side_length: Grid.default_side_length).run
    end
  end
end
