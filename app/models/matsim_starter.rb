class MatsimStarter
  OUTPUT_PATH = Rails.root.join('public', 'matsim', 'output')
  JAVA_PATH = Rails.root.join('lib', 'matsim', 'java')

  def initialize(id, year, folder = OUTPUT_PATH)
    @id = id
    @year = year
    @folder = folder
    raise "#{year} must be between 2017 and 2040" unless year_range.include?(year)
    run
  end

  # rubocop:disable LineLength
  def run
    Kernel.system "java -cp #{JAVA_PATH}/innoz-toolbox-0.1-SNAPSHOT.jar com.innoz.toolbox.run.Preto #{id} #{year} #{folder} >/dev/null 2>&1"
  end

  private

  def year_range
    2017..2040
  end

  attr_reader :id, :year, :folder
end
