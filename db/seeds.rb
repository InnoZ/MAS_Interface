# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

SEED_PATH = Rails.root.join('public', 'matsim', 'seeds')
ATTRIBUTES = {
  'Garmisch-Partenkirchen' => { 'district_id' => '09180', 'year' => 2015 },
  'Osnabrueck' => { 'district_id' => '03404', 'year' => 2017 },
}
POSTFIXES = %w[with_carsharing without_carsharing]

# If you want to run the app with seeds, get the mentioned json files from
# GISDATA. The files are not provided through the github repository, because
# of their huge size. Regard the path names and place the json files correctly.

def seeds_available?(district_id, year, features, aggregated_analysis)
  !Scenario.where(district_id: district_id, year: year, seed: true).exists?&&
    File.exist?(features) &&
    File.exist?(aggregated_analysis)
end

if seeds_available?(
  ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('district_id'),
  ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('year'),
  ("#{SEED_PATH}/#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('district_id')}_#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('year')}_#{POSTFIXES.first}/features.json"),
  ("#{SEED_PATH}/#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('district_id')}_#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('year')}_#{POSTFIXES.first}/aggregatedAnalysis.json"),
)
  Scenario.create(
    district_id: ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('district_id'),
    year: ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('year'),
    agents: File.read("#{SEED_PATH}/#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('district_id')}_#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('year')}_#{POSTFIXES.first}/features.json"),
    statistics: File.read("#{SEED_PATH}/#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('district_id')}_#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('year')}_#{POSTFIXES.first}/aggregatedAnalysis.json"),
    seed: true
  )
end

if seeds_available?(
  ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('district_id'),
  ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('year'),
  ("#{SEED_PATH}/#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('district_id')}_#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('year')}_#{POSTFIXES.last}/features.json"),
  ("#{SEED_PATH}/#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('district_id')}_#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('year')}_#{POSTFIXES.last}/aggregatedAnalysis.json"),
)
  Scenario.create(
    district_id: ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('district_id'),
    year: ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('year'),
    agents: File.read("#{SEED_PATH}/#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('district_id')}_#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('year')}_#{POSTFIXES.last}/features.json"),
    statistics: File.read("#{SEED_PATH}/#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('district_id')}_#{ATTRIBUTES.fetch('Garmisch-Partenkirchen').fetch('year')}_#{POSTFIXES.last}/aggregatedAnalysis.json"),
    seed: true
  )
end

if seeds_available?(
  ATTRIBUTES.fetch('Osnabrueck').fetch('district_id'),
  ATTRIBUTES.fetch('Osnabrueck').fetch('year'),
  ("#{SEED_PATH}/#{ATTRIBUTES.fetch('Osnabrueck').fetch('district_id')}_#{ATTRIBUTES.fetch('Osnabrueck').fetch('year')}_#{POSTFIXES.first}/features.json"),
  ("#{SEED_PATH}/#{ATTRIBUTES.fetch('Osnabrueck').fetch('district_id')}_#{ATTRIBUTES.fetch('Osnabrueck').fetch('year')}_#{POSTFIXES.first}/aggregatedAnalysis.json"),
)
  Scenario.create(
    district_id: ATTRIBUTES.fetch('Osnabrueck').fetch('district_id'),
    year: ATTRIBUTES.fetch('Osnabrueck').fetch('year'),
    agents: File.read("#{SEED_PATH}/#{ATTRIBUTES.fetch('Osnabrueck').fetch('district_id')}_#{ATTRIBUTES.fetch('Osnabrueck').fetch('year')}_#{POSTFIXES.first}/features.json"),
    statistics: File.read("#{SEED_PATH}/#{ATTRIBUTES.fetch('Osnabrueck').fetch('district_id')}_#{ATTRIBUTES.fetch('Osnabrueck').fetch('year')}_#{POSTFIXES.first}/aggregatedAnalysis.json"),
    seed: true
  )
end
