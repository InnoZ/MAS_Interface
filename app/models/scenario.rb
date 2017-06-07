# rubocop:disable ClassLength, MethodLength
class Scenario < ApplicationRecord
  validates :district_id, presence: true
  validates :year, presence: true, numericality: { only_integer: true }

  def district_name
    DistrictsGermany.name(district_id)
  end

  def district_geometry
    DistrictsGermany.geometry(district_id)
  end

  def district_feature
    DistrictsGermany.feature(district_id)
  end

  def feature_collection
    {
      type: 'FeatureCollection',
      features: features,
    }
  end

  def features
    feature_values.map do |feature|
      {
        type: 'Feature',
        geometry: JSON.parse(feature[:geometry]),
        properties: {
          x: feature[:x],
          y: feature[:y],
        },
      }
    end
  end

  def feature_values
    DB[:grids]
      .where(district_id: district_id, side_length: Grid.default_side_length)
      .select(:x, :y)
      .select_append { ST_AsGeoJSON(cell).as(:geometry) }
      .group(:x, :y, :cell)
  end

  # rubocop:disable LineLength
  def centroid_latitude
    DB["SELECT ST_Y(ST_Centroid(ST_GeomFromGeoJSON('#{DistrictsGermany.geometry(district_id).to_json}')));"].first[:st_y]
  end

  def centroid_longitude
    DB["SELECT ST_X(ST_Centroid(ST_GeomFromGeoJSON('#{DistrictsGermany.geometry(district_id).to_json}')));"].first[:st_x]
  end

  def centroid
    [Float(centroid_latitude), Float(centroid_longitude)]
  end

  def district_area
    Float(
      DB["SELECT ST_Area(ST_GeomFromGeoJSON('#{DistrictsGermany.geometry(district_id).to_json}')::geography);"].first[:st_area] /
      1_000_000
    ).round(2)
  end

  def modal_split
    {
      'modal_split' =>
        modes.map do |mode|
          {
            'mode' => mode_name(mode),
            'share' => percent_calculator(plans.where(mode: mode).count, plans.size),
          }
        end,
    }
  end

  def traffic_performance
    [
      {
        'key' => 'traffic_performance',
        'values' => person_km.flat_map do |mode, distance|
          {
            'mode' => mode_name(mode),
            'traffic_performance' => String(distance.to_f),
          }
        end,
      },
    ]
  end

  def carbon_emission
    [
      {
        'key' => 'carbon_emission',
        'values' => carbon_emissions.flat_map do |mode, carbon_emission|
          {
            'mode' => mode_name(mode),
            'carbon_emission' => String(carbon_emission.to_f),
          }
        end,
      },
    ]
  end

  def agent_size
    plans.select(:agent_id).size
  end

  def percent_calculator(part, all, multiplicator = 100.0)
    # TODO: if there are no plans it doesn't make sense to return 0
    # just for now to protect against ZeroDivision Error

    return 0 if all.zero?

    part.fdiv(all) * multiplicator
  end

  def plans
    Plan.where(scenario_id: "#{district_id}_#{year}")
  end

  def modes
    plans.pluck(:mode).uniq.sort
  end

  def mode_name(mode)
    case I18n.locale
    when :en
      {
        'bike' => 'Bike',
        'car' => 'Car',
        'carsharing' => 'Carsharing',
        'ride' => 'Ride',
        'other' => 'Other',
        'pt' => 'Public Transport',
        'walk' => 'Walk',
      }.fetch(mode)
    when :de
      {
        'bike' => 'Fahrrad',
        'car' => 'Auto',
        'carsharing' => 'Carsharing',
        'ride' => 'Mitfahrer',
        'other' => 'Sonstiges',
        'pt' => 'Öffentlicher Verkehr',
        'walk' => 'Fußweg',
      }.fetch(mode)
    end
  end

  def seed_text
    return 'Ein vorberechnetes Szenario aus den Seeds' if seed

    'Ein neu generiertes Szenario'
  end

  # pretotype
  def diurnal_curve
    File.read(Rails.root.join('public/pretotype/diurnal_curve.json'))
  end

  # pretotype
  def boxplot
    File.read(Rails.root.join('public/pretotype/boxplot.json'))
  end
end
