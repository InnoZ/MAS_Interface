class GridFill
  attr_reader :scenario, :side_length, :radius, :district_json

  def initialize(scenario:, side_length:)
    @scenario = scenario
    @side_length = side_length
    @district_json = DistrictsGermany.geometry(scenario.district_id).to_json
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
      o.ST_Transform(
        o.ST_SetSRID(
          o.ST_GeomFromGeoJSON(district_json),
          4326
        ),
        utm_zone.id
      )
    end
  end

  def longitude
    DB["SELECT ST_X(ST_Centroid(ST_GeomFromGeoJSON('#{district_json}')));"].first[:st_x]
  end

  def utm_zone
    UTMZone.new(longitude)
  end
end
