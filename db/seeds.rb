# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

SEED_PATH = Rails.root.join('public', 'matsim', 'seeds')
DISTRICT_ID = '09180'
YEAR = 2015
POSTFIXES = %w[with_carsharing without_carsharing]

# If you want to run the app with seeds, get the mentioned json files from
# GISDATA. The files are not provided through the github repository, because
# of their huge size. Regard the path names and place the json files correctly.

def runable?
  !Scenario.where(district_id: DISTRICT_ID, year: YEAR).exists? &&
    File.exist?("#{SEED_PATH}/#{DISTRICT_ID}_#{YEAR}_#{POSTFIXES.first}/features.json") &&
    File.exist?("#{SEED_PATH}/#{DISTRICT_ID}_#{YEAR}_#{POSTFIXES.first}/aggregatedAnalysis.json") &&
    File.exist?("#{SEED_PATH}/#{DISTRICT_ID}_#{YEAR}_#{POSTFIXES.last}/features.json") &&
    File.exist?("#{SEED_PATH}/#{DISTRICT_ID}_#{YEAR}_#{POSTFIXES.last}/aggregatedAnalysis.json")
end

if runable?
  POSTFIXES.each do |postfix|
    Scenario.create(
      district_id: DISTRICT_ID,
      year: YEAR,
      agents: File.read("#{SEED_PATH}/#{DISTRICT_ID}_#{YEAR}_#{postfix}/features.json"),
      statistics: File.read("#{SEED_PATH}/#{DISTRICT_ID}_#{YEAR}_#{postfix}/aggregatedAnalysis.json")
    )
  end
end
