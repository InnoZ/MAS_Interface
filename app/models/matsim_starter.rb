class MatsimStarter
  OUTPUT_PATH = Rails.root.join('public', 'matsim', 'output')
  JAVA_PATH = Rails.root.join('lib', 'matsim', 'java', 'innoz-toolbox-0.1-SNAPSHOT-2017-08-17.jar')
  LOG_PATH = Rails.root.join('log', 'matsim')
  CALIBRATION_CLASS = 'ModalSplitCalibrationModule'

  def initialize(district_id, year, name, folder = OUTPUT_PATH, rails_env = Rails.env)
    @district_id = district_id
    @year = year
    @name = name
    @folder = folder
    @rails_env = rails_env
    raise "#{year} must be between 2017 and 2040" unless year_range.include?(year)
    run_matsim
    calculate_stats
    add_scenario_name
  end

  attr_reader :district_id, :year, :name, :folder, :rails_env

  # rubocop:disable LineLength
  def run_matsim
    run_calibration = false
    if rails_env == 'production'
      java_class = 'Main'
    else
      # simulate processing delay
      sleep(10) if rails_env == 'development'
      java_class = 'Preto'
    end
    log_path_exp = LOG_PATH.join("#{district_id}_#{year}")
    Dir.mkdir(log_path_exp)    
    Kernel.system("java -Xmx18G -XX:-UseGCOverheadLimit -cp #{JAVA_PATH} com.innoz.toolbox.run.#{java_class} #{district_id} #{year} #{folder} #{rails_env} #{LOG_PATH} 2> #{log_path_exp}/stderr.log ")
    if run_calibration == true
      # Params Config.xml, sampleFactor, scenarioName
      #  sampleFactor -> 1 = 1000 Agents; 0.5 = 500 Agents
      Kernel.system("java -mx4g -cp #{JAVA_PATH} com.innoz.toolbox.run.calibration.#{CALIBRATION_CLASS} #{folder}/#{district_id}_#{year}/config.xml.gz 0.5 #{district_id}_#{year} 2> #{log_path_exp}/calibration_run_shell.log") 
    end
    @scenario = Scenario.find_by(year: year, district_id: district_id)
  end

  def add_scenario_name
    @scenario.update(name: name)
  end

  def calculate_stats
    error = 'Matsim scenario creation not completed. Database user \'matsim\' existing? Look into matsim logfiles for more information.'
    raise error unless @scenario
    @scenario.calculate_od_relations_and_modal_split
  end

  private

  def year_range
    2017..2040
  end
end
