class UTMZone
  attr_reader :longitude

  def initialize(longitude)
    @longitude = longitude
  end

  def id
    32_600 + ((longitude + 180) / 360 * 60).ceil
  end
end
