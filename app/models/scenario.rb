# rubocop:disable ClassLength
class Scenario < ApplicationRecord
  validates :district_id, presence: true
  validates :year, presence: true, numericality: { only_integer: true }

  default_scope { order(year: :asc) }

  def calculate_od_relations_and_modal_split
    unless Grid.find_by(district_id: district_id, side_length: Grid.default_side_length)
      GridFill.new(district_id: district_id, side_length: Grid.default_side_length).run
    end
    update_attribute(:od_relations, od_relations_json)
    update_attribute(:modal_split, modal_split_json)
  end

  def od_relations_json
    hash = {}
    available_modes.each do |mode|
      hash[mode] = Destinations.new(district_id, year, mode).feature_collection
    end
    hash.to_json
  end

  def scenario_map_infos
    {
      district_id: district_id,
      name: name,
      year: year,
      population: population,
    }
  end

  def json_all(modifiers:)
    {
      'district_geometry' => district_geometry,
      'traffic_performance' => traffic_performance(modifiers: modifiers),
      'diurnal_json' => diurnal_json,
      'carbon_emission' => carbon_emission(modifiers: modifiers),
      'modal_split' => modal_split(modifiers: modifiers),
      'mode_colors' => mode_colors,
    }
  end

  def modal_split(modifiers: nil)
    available_modes.map do |mode|
      factor = %w[car ride carsharing].include?(mode) ? factorize(modifiers&.fetch(:motorized_share)) : 1
      {
        'mode' => mode,
        'color' => mode_color(mode),
        'share' => plans.where(mode: mode).count * factor,
      }
    end
  end

  def traffic_performance(modifiers: nil)
    mode_order(person_km).map do |mode, distance|
      factor = %w[car ride carsharing].include?(mode) ? factorize(modifiers&.fetch(:motorized_share)) : 1
      {
        'mode' => mode,
        'color' => mode_color(mode),
        'traffic' => distance.to_i * factor,
      }
    end
  end

  def carbon_emission(modifiers: nil)
    mode_order(carbon_emissions).map do |mode, carbon_emission|
      factor1 = %w[car ride carsharing].include?(mode) ? factorize(modifiers&.fetch(:motorized_share)) : 1
      factor2 = %w[car ride carsharing].include?(mode) ? factorize(modifiers&.fetch(:car_carbon)) : 1
      {
        'mode' => mode,
        'color' => mode_color(mode),
        'carbon' => carbon_emission.to_i * factor1 * factor2,
      }
    end
  end

  def factorize(value)
    return 1 if !value || value.to_f == 0
    value.to_f > 0 ? (value.to_f) : (1 / value.to_f.abs)
  end

  def full_name
    district_name + ' | ' + year.to_s
  end

  def district_name
    DistrictsGermany.name(district_id)
  end

  def district_geometry
    DistrictsGermany.geometry(district_id)
  end

  def district_area
    district = DistrictsGermany.geometry(district_id).to_json
    Float(
      DB["SELECT ST_Area(ST_GeomFromGeoJSON('#{district}')::geography);"].first[:st_area] /
      1_000_000
    ).round(2)
  end

  def diurnal_json
    available_modes.map do |mode|
      {
        'key' => mode,
        'color' => mode_color(mode),
        'values' => values_per_hour(mode),
      }
    end
  end

  def mode_order(array)
    array.sort_by { |element| mode_priority(element[0]) }
  end

  def values_per_hour(mode)
    diurnal_curve.group_by { |element| element[0] }.fetch(mode).map do |_mode, hour, value|
      [hour.to_i, value.to_f]
    end
  end

  def agent_size
    plans.select(:agent_id).size
  end

  def plans
    Plan.where(scenario_id: "#{district_id}_#{year}")
  end

  def available_modes
    plans.pluck(:mode).uniq.sort_by { |element| mode_priority(element) }
  end

  def seed_text
    seed ? 'Ein vorberechnetes Szenario aus den Seeds' : 'Ein neu generiertes Szenario'
  end

  # pretotype
  def boxplot
    File.read(Rails.root.join('public/pretotype/boxplot.json'))
  end

  def mode_color(mode)
    mode_colors.fetch(mode)
  end

  def mode_colors
    {
      'bike' => '#50a0b5',
      'car' => '#f2b50c',
      'carsharing' => '#db8012',
      'ride' => '#f4c85b',
      'other' => '#bdb8b3',
      'walk' => '#3db783',
      'pt' => '#c94380',
    }
  end

  def mode_priority(mode)
    mode_priorities.fetch(mode)
  end

  def mode_priorities
    {
      'bike' => 5,
      'car' => 1,
      'carsharing' => 3,
      'ride' => 2,
      'other' => 7,
      'walk' => 6,
      'pt' => 4,
    }
  end
end
