# rubocop:disable Metrics/ClassLength
class Destinations
  attr_reader :district_id, :year, :mode

  def initialize(district_id, year, mode)
    @district_id = district_id
    @year = year
    @mode = mode
  end

  START_POINT_LIMIT = 100
  PLANS_LIMIT = 100_000 # only for rapid testing purposes

  def feature_collection
    {
      type: 'FeatureCollection',
      crs: { type: 'name', 'properties': { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features: mapped_features
    }
  end

  def mapped_features
    DB.fetch(mode_destinations_query).all.map do |r|
      {
        type: 'Feature',
        id: r[:start_grid],
        geometry: eval(r[:geometry_start]), # eval for cleaning string from escape quotes
        properties: {
          start: {
            activity_points: merge_start_points_and_activities(r[:start_points], r[:activities_start])[0..START_POINT_LIMIT],
            heatmap_points: repair_coordinates(r[:start_points]),
            activity_split: r[:activities_start].group_by(&:itself).map { |k,v| [k, v.count] }.to_h,
            destinations: r[:destinations].sort_by { |v| v[1] }.reverse.map { |v| Hash[v[0], v[1]] },
            featureCount: r[:count_start],
            featureMaxDestinationCount: r[:max_count_start],
          },
          end: {
            activity_points: merge_start_points_and_activities(r[:end_points], r[:activities_end])[0..START_POINT_LIMIT],
            heatmap_points: repair_coordinates(r[:end_points]),
            activity_split: r[:activities_end].group_by(&:itself).map { |k,v| [k, v.count] }.to_h,
            destinations: r[:origins].sort_by { |v| v[1] }.reverse.map { |v| Hash[v[0], v[1]] },
            featureCount: r[:count_end],
            featureMaxDestinationCount: r[:max_count_end],
          }
        }
      }
    end
  end

  private

  # rubocop:disable Eval
  def merge_start_points_and_activities(points, activities)
    (repair_coordinates(points).zip(activities)).shuffle
  end

  def repair_coordinates(array)
    # converts ['12','52','13','53'] to [[12,52], [13, 53]]
    even = array.each_with_index.map { |v, i| v.to_f if (i+1).even? }.compact
    odd = array.each_with_index.map { |v, i| v.to_f if (i+1).odd? }.compact
    odd.zip(even).map{ |coord| [coord[1], coord[0]] }
  end

  def mode_selector
    "AND mode = '#{mode}'" if mode
  end

  def plans_limit
    "LIMIT #{PLANS_LIMIT}" if PLANS_LIMIT
  end

  def mode_destinations_query
    <<-SQL
    WITH ways AS (
     SELECT
      location_start AS start_point,
      location_end AS end_point,
      from_activity_type, to_activity_type
      FROM (
        SELECT * FROM plans WHERE scenario_id = '#{district_id}_#{year}'
        #{mode_selector}
        ORDER BY RANDOM()
        #{plans_limit}
      )t1
    ),

    grid AS (
      SELECT * FROM grids WHERE district_id = '#{district_id}'
    ),

    matrix AS (
      SELECT
        grid_start.id AS start_grid,
        grid_end.id AS end_grid,
        grid_start.cell AS geometry_start,
        grid_end.cell AS geometry_end,
        ARRAY[ST_X(ways.start_point::geometry), ST_Y(ways.start_point::geometry)] AS start_point,
        ARRAY[ST_X(ways.end_point::geometry), ST_Y(ways.end_point::geometry)] AS end_point,
        from_activity_type, to_activity_type
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

    grouped_start AS (
      SELECT
        ST_AsGeoJSON(geometry_start) AS geometry_start,
        array_agg(start_point) as start_points,
        array_agg(from_activity_type) as activities_start,
        start_grid, end_grid, count(*)
      FROM matrix
      GROUP BY
        start_grid, end_grid, geometry_start
    ),

    grouped_end AS (
      SELECT
        array_agg(end_point) as end_points,
        array_agg(to_activity_type) as activities_end,
        start_grid, end_grid, count(*)
      FROM matrix
      GROUP BY
        start_grid, end_grid
    ),

    starts AS (
      SELECT
        geometry_start,
        start_grid,
        /* since in psql aggregating of differently dimensioned arrays is not allowed.
           Provides an array like ['1','2','3','4'] to be repaired later */
        string_to_array(string_agg(array_to_string(start_points, ','), ','), ',') AS start_points,
        string_to_array(string_agg(array_to_string(activities_start, ','), ','), ',') AS activities_start,
        array_agg(array[end_grid, count]) AS destinations,
        sum(count)::integer as count_start,
        max(count)::integer as max_count_start
      FROM grouped_start
      GROUP BY
        geometry_start, start_grid
    ),

    ends AS (
      SELECT
        end_grid,
        /* since in psql aggregating of differently dimensioned arrays is not allowed.
           Provides an array like ['1','2','3','4'] to be repaired later */
        string_to_array(string_agg(array_to_string(end_points, ','), ','), ',') AS end_points,
        string_to_array(string_agg(array_to_string(activities_end, ','), ','), ',') AS activities_end,
        array_agg(array[start_grid, count]) AS origins,
        sum(count)::integer as count_end,
        max(count)::integer as max_count_end
      FROM grouped_end
      GROUP BY
        end_grid
    )

    SELECT starts.*, ends.* FROM starts JOIN ends ON starts.start_grid = ends.end_grid

    SQL
  end
end
