class MatsimStarter
  DEFAULT = Rails.root.join('public', 'matsim', 'xml')
  MATSIM = Rails.root.join('lib', 'matsim', 'jar')

  def initialize(id, year, folder = DEFAULT)
    @id = id
    @year = year
    @folder = folder
    raise "#{year} must be between 2017 and 2040" unless year_range.include?(year)
    run
  end

  # rubocop:disable LineLength
  def run
    Kernel.system "java -cp #{MATSIM}/innoz-toolbox-0.1-SNAPSHOT.jar com.innoz.toolbox.run.Preto #{id} #{year} #{folder} >/dev/null 2>&1"
  end

  def statistics
    File.read("#{DEFAULT}/#{id}_#{year}/aggregatedAnalysis.json")
  end

  def agents
    File.read("#{DEFAULT}/#{id}_#{year}/features.json")
  end

  private

  def year_range
    2017..2040
  end

  attr_reader :id, :year, :folder
end
