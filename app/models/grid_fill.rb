class GridFill
  attr_reader :scenario, :side_length, :radius

  def initialize(scenario:, side_length:, radius: default_radius)
    @scenario = scenario
    @side_length = side_length
    @radius = radius
  end

  def default_radius
    60_000 / 2
  end

  def run
    DB[:grids].insert(%i[district_id side_length x y cell], dataset)
  end

  # rubocop:disable AbcSize, UnusedBlockArgument
  def dataset
    DB[GridFactory.new(bounds: bounds, side_length: side_length).dataset]
      .select        { |o| scenario.district_id }
      .select_append { |o| side_length }
      .select_append(:x, :y)
      .select_append { |o| o.ST_Transform(o.ST_SetSRID(o.cell, utm_zone.id), 4326) }
  end

  def bounds
    Sequel.virtual_row do |o|
      o.ST_Expand(
        o.ST_Transform(
          o.ST_SetSRID(
            o.ST_MakePoint(scenario.centroid_longitude, scenario.centroid_latitude),
            4326
          ),
          utm_zone.id
        ),
        radius
      )
    end
  end

  def utm_zone
    UTMZone.new(scenario.centroid_longitude)
  end
end
