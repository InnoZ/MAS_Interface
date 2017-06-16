# rubocop:disable ClassLength
class Scenario < ApplicationRecord
  validates :district_id, presence: true
  validates :year, presence: true, numericality: { only_integer: true }

  def self.make(district_id:, year:)
    MatsimStarter.new(district_id, year)
    record = find_by(year: year, district_id: district_id)
    record.calculate_od_relations
    record.calculate_density_count
    record
  end

  def calculate_od_relations
    unless Grid.find_by(district_id: district_id, side_length: Grid.default_side_length)
      GridFill.new(district_id: district_id, side_length: Grid.default_side_length).run
    end
    update_attribute(:od_relations, od_relations_json)
  end

  def od_relations_json
    hash = {}
    available_modes.each do |mode|
      hash[mode] = Destinations.new(district_id, year, mode).feature_collection
    end
    hash.to_json
  end

  def calculate_density_count
    unless Grid.find_by(district_id: district_id, side_length: Grid.default_side_length)
      GridFill.new(district_id: district_id, side_length: Grid.default_side_length).run
    end
    update_attribute(:density_count, density_count_json)
  end

  def density_count_json
    hash = {}
    available_modes.each do |mode|
      hash[mode] = Density.new(district_id, year, mode).feature_collection
    end
    hash.to_json
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

  def modal_split
    total_count = plans.size
    {
      'modal_split' =>
        available_modes.map do |mode|
          {
            'mode' => I18n.t("mode_names.#{mode}"),
            'color' => mode_color(mode),
            'share' => percent_calculator(plans.where(mode: mode).count, total_count),
          }
        end,
    }
  end

  def traffic_performance
    [
      {
        'key' => 'traffic_performance',
        'values' => mode_order(person_km).flat_map do |mode, distance|
          {
            'mode' => I18n.t("mode_names.#{mode}"),
            'color' => mode_color(mode),
            'traffic_performance' => String(distance),
          }
        end,
      },
    ]
  end

  def carbon_emission
    [
      {
        'key' => 'carbon_emission',
        'values' => mode_order(carbon_emissions).flat_map do |mode, carbon_emission|
          {
            'mode' => I18n.t("mode_names.#{mode}"),
            'color' => mode_color(mode),
            'carbon_emission' => String(carbon_emission.to_f),
          }
        end,
      },
    ]
  end

  def diurnal_json
    available_modes.map do |mode|
      {
        'key' => I18n.t("mode_names.#{mode}"),
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

  def percent_calculator(part, all, multiplicator = 100.0)
    # TODO: if there are no plans it doesn't make sense to return 0
    # just for now to protect against ZeroDivision Error

    return 0 if all.zero?

    part.fdiv(all) * multiplicator
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
