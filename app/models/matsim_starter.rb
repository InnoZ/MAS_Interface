class MatsimStarter
  OUTPUT_PATH = Rails.root.join('public', 'matsim', 'output')
  JAVA_PATH = Rails.root.join('lib', 'matsim', 'java', 'innoz-toolbox-0.1-SNAPSHOT-2017-07-25.jar')

  def initialize(district_id, year, folder = OUTPUT_PATH, rails_env = Rails.env)
    @district_id = district_id
    @year = year
    @folder = folder
    @rails_env = rails_env
    raise "#{year} must be between 2017 and 2040" unless year_range.include?(year)
    run
  end

  # rubocop:disable LineLength
  def run
    sleep(10)
    if rails_env == 'production'
      java_class = 'Main'
    else
      java_class = 'Preto'
    end
    Kernel.system("java -mx4g -cp #{JAVA_PATH} com.innoz.toolbox.run.#{java_class} #{district_id} #{year} #{folder} #{rails_env}  >/dev/null 2>&1")
  end

  private

  def year_range
    2017..2040
  end

  attr_reader :district_id, :year, :folder, :rails_env
end
