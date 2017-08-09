class MatsimStarter
  OUTPUT_PATH = Rails.root.join('public', 'matsim', 'output')
  JAVA_PATH = Rails.root.join('lib', 'matsim', 'java', 'innoz-toolbox-0.1-SNAPSHOT-2017-08-07.jar')
  LOG_PATH = Rails.root.join('log', 'matsim')

  def initialize(district_id, year, folder = OUTPUT_PATH, rails_env = Rails.env)
    @district_id = district_id
    @year = year
    @folder = folder
    @rails_env = rails_env
    raise "#{year} must be between 2017 and 2040" unless year_range.include?(year)
    run_matsim
    calculate_stats
  end

  # rubocop:disable LineLength
  def run_matsim
    if rails_env == 'production'
      java_class = 'Main'
    else
      sleep(10) if rails_env == 'development'
      java_class = 'Preto'
    end
    Kernel.system("java -mx4g -cp #{JAVA_PATH} com.innoz.toolbox.run.#{java_class} #{district_id} #{year} #{folder} #{rails_env} #{LOG_PATH} >/dev/null 2>&1")
  end

  def calculate_stats
    error = 'Matsim scenario creation not completed. Look into matsim logfiles for more information.'
    raise error unless (scenario = Scenario.find_by(year: year, district_id: district_id))
    scenario.calculate_od_relations_and_modal_split
  end

  private

  def year_range
    2017..2040
  end

  attr_reader :district_id, :year, :folder, :rails_env
end
