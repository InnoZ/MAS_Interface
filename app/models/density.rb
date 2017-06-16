class Density
  attr_reader :district_id, :year, :mode

  def initialize(district_id, year, mode)
    @district_id = district_id
    @year = year
    @mode = mode
  end

  def feature_collection
    {
      type: 'FeatureCollection',
      features: features,
    }
  end

  private

  def features
    feature_values.map do |feature|
      {
        type: 'Feature',
        geometry: JSON.parse(feature[:geometry]),
        properties: {
          densityCount: feature[:count],
        },
      }
    end
  end

  def feature_values
    DB.fetch(
      "SELECT ST_AsGeoJSON(cell) as geometry, count(*) AS count FROM plans, grids
       WHERE grids.cell && location_start AND ST_Covers(grids.cell, location_start)
       AND scenario_id = '#{district_id}_#{year}' AND mode = '#{mode}' GROUP BY grids.cell;"
    )
  end
end
