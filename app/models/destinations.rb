# rubocop:disable Metrics/ClassLength
class Destinations
  attr_reader :district_id, :year, :mode

  def initialize(district_id, year, mode)
    @district_id = district_id
    @year = year
    @mode = mode
  end

  START_POINT_LIMIT = 100

  # rubocop:disable Eval
  def mapped_features
    mode_geojson.map do |f|
      {
        type: 'Feature',
        id: f[:id],
        geometry: eval(f[:geometry]), # eval for cleaning string from escape quotes
        properties: properties(f),
      }
    end
  end

  def mode_geojson
    mode_destinations.map do |r|
      {
        id:           r[:start_grid],
        geometry:     r[:geometry],
        start_points: repair_coordinates(r[:start_points])[0..START_POINT_LIMIT],
        destinations: r[:destinations].sort_by { |v| v[1] }.reverse.map { |v| Hash[v[0], v[1]] },
      }
    end
  end

  def mode_destinations
    @mode_destinations ||= DB.fetch(mode_destinations_query).all
  end

  def mode_selector
    "AND mode = '#{mode}'" if mode
  end

  def mode_destinations_query
    <<-SQL
    WITH ways AS (
     SELECT
      location_start AS start_point,
      location_end AS end_point
      FROM (
        SELECT * FROM plans WHERE scenario_id = '#{district_id}_#{year}' #{mode_selector}
      )t1
    ),

    grid AS (
      SELECT * FROM grids WHERE district_id = '#{district_id}'
    ),

    matrix AS (
      SELECT
        grid_start.id AS start_grid,
        grid_end.id AS end_grid,
        grid_start.cell AS geometry,
        ARRAY[ST_X(ways.start_point::geometry), ST_Y(ways.start_point::geometry)] AS start_point
      FROM
        ways
      JOIN
        grid grid_start
      ON
        grid_start.cell && ways.start_point AND ST_Covers(grid_start.cell, ways.start_point)
      JOIN
        grid grid_end
      ON
        grid_end.cell && ways.end_point AND ST_Covers(grid_end.cell, ways.end_point)
    ),

    grouped AS (
      SELECT
        ST_AsGeoJSON(geometry) AS geometry,
        array_agg(start_point) as start_points,
        start_grid, end_grid, count(*)
      FROM matrix
      GROUP BY
        start_grid, end_grid, geometry
    )

    SELECT
      geometry,
      start_grid,
      /* since in psql aggregating of differently dimensioned arrays is not allowed.
         Provides an array like ['1','2','3','4'] to be repaired later */
      string_to_array(string_agg(array_to_string(start_points, ','), ','), ',') AS start_points,
      array_agg(array[end_grid, count]) AS destinations
      FROM grouped
      GROUP BY
        geometry, start_grid
    SQL
  end

  def repair_coordinates(array)
    # converts ['12','52','13','53'] to [[12,52], [13, 53]]
    even = array.each_with_index.map { |v, i| v.to_f if (i+1).even? }.compact
    odd = array.each_with_index.map { |v, i| v.to_f if (i+1).odd? }.compact
    odd.zip(even)
  end

  def feature_collection
    feature_starts = mapped_features.map { |f| f[:properties][:featureStarts] }.compact
    {
      type: 'FeatureCollection',
      crs: { type: 'name', 'properties': { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features: mapped_features,
      properties: {
        totalCount: feature_starts.sum,
        maxCount: feature_starts.max,
      },
    }
  end

  def properties(feature)
    json = {}
    feature.each do |key, value|
      next if %w[geometry id].include?(key.to_s)
      json.merge!(key => value)
    end
    values = feature[:destinations].map { |f| f.first[1] }
    feature_max = values.max
    feature_sum = values.compact.sum
    json
      .merge(featureMaxCount: feature_max)
      .merge(featureStarts: feature_sum)
  end
end
