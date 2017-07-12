class MatsimStarter
  OUTPUT_PATH = Rails.root.join('public', 'matsim', 'output')
  JAVA_PATH = Rails.root.join('lib', 'matsim', 'java', '*.jar')

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
    sleep(20)
    Kernel.system("java -cp #{JAVA_PATH} com.innoz.toolbox.run.Preto #{district_id} #{year} #{folder} #{rails_env} >/dev/null 2>&1")
  end

  private

  def year_range
    2017..2040
  end

  attr_reader :district_id, :year, :folder, :rails_env
end
