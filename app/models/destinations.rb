class Destinations
  attr_reader :district_id, :year, :mode

  def initialize(district_id, year, mode)
    @district_id = district_id
    @year = year
    @mode = mode
  end

  def mode_geojson
    geojson_ready(mode_destinations)
  end

  # rubocop:disable AbcSize
  def geojson_ready(db_output)
    grouped_results(db_output).map do |r|
      {
        id:           r[0][:id],
        name:         r[0][:name],
        geometry:     r[0][:geometry],
        destinations: r[1].sort_by { |v| v[:count] }.reverse.map { |v| Hash[v[:end_grid], v[:count]] },
      }
    end
  end

  def grouped_results(db_output)
    db_output.group_by do |r|
      {
        id:       r[:start_grid],
        name:     r[:start_name],
        geometry: r[:geometry],
      }
    end
  end

  def mode_destinations
    @mode_destinations ||= DB.fetch(mode_destinations_query).all
  end

  def mode_destinations_query
    <<-SQL
      WITH ways AS (
       SELECT
        location_start AS start_point,
        location_end AS end_point
        FROM (
          SELECT * FROM plans
          WHERE scenario_id = '#{district_id}_#{year}' AND mode = '#{mode}'
        )t1
      ),
    grid AS (
      SELECT * FROM grids WHERE district_id = '#{district_id}'
    ),

    matrix AS (
      SELECT
        grid_start.id AS start_grid,
        grid_end.id AS end_grid,
        grid_start.cell AS geometry
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
    )

    SELECT
      ST_AsGeoJSON(geometry) AS geometry,
      start_grid, end_grid, count(*)
    FROM matrix
    GROUP BY
      start_grid, end_grid, geometry
    SQL
  end

  def max_count
    mode_destinations.max_by { |m| m[:count] }[:count]
  end

  def feature_collection
    {
      type: 'FeatureCollection',
      crs: { type: 'name', 'properties': { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features: mapped_features,
      properties: { maxCount: max_count },
    }
  end

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

  def properties(feature)
    json = {}
    feature.each do |key, value|
      next if %w[geometry id].include?(key.to_s)
      json.merge!(key => value)
    end
    json
  end
end
