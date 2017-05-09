class MatsimStarter
  DEFAULT = Rails.root.join('public', 'matsim', 'xml').to_s
  MATSIM = Rails.root.join('lib', 'matsim', 'jar').to_s

  def initialize(id, year, folder = DEFAULT)
    @id = id
    @year = year
    @folder = folder
    raise "#{year} must be between 2009 and 2040" unless year_range.include?(year)
  end

  # rubocop:disable LineLength
  def start
    Kernel.system "java -cp #{MATSIM}/innoz-toolbox-0.1-SNAPSHOT.jar com.innoz.toolbox.run.Preto #{id} #{year} #{folder} >/dev/null 2>&1"
  end

  def json
    json = File.read("#{DEFAULT}/#{id}_#{year}/features.json")

    if json
      JSON.parse(json).fetch('crs').fetch('properties').fetch('name')
    else
      raise "#{json} does not exist yet"
    end
  end

  private

  def year_range
    2009..2040
  end

  attr_reader :id, :year, :folder
end
