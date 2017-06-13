class Scenario < ApplicationRecord
  validates :district_id, presence: true
  validates :year, presence: true, numericality: { only_integer: true }

  def district_name
    DistrictsGermany.name(district_id)
  end

  def district_geometry
    DistrictsGermany.geometry(district_id)
  end

  def od_relations
    hash = {}
    modes.each do |mode|
      hash[mode] = Destinations.new(district_id, year, mode).feature_collection
    end
    hash
  end

  def district_area
    district = DistrictsGermany.geometry(district_id).to_json
    Float(
      DB["SELECT ST_Area(ST_GeomFromGeoJSON('#{district}')::geography);"].first[:st_area] /
      1_000_000
    ).round(2)
  end

  def modal_split
    {
      'modal_split' =>
        modes.map do |mode|
          {
            'mode' => I18n.t("mode_names.#{mode}"),
            'share' => percent_calculator(plans.where(mode: mode).count, plans.size),
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
            'carbon_emission' => String(carbon_emission.to_f),
          }
        end,
      },
    ]
  end

  def diurnal_json
    modes.map do |mode|
      {
        'key' => I18n.t("mode_names.#{mode}"),
        'values' => values_per_hour(mode),
      }
    end
  end

  def mode_order(array)
    array.sort_by { |element| element[0] }
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

  def modes
    plans.pluck(:mode).uniq.sort
  end

  def seed_text
    seed ? 'Ein vorberechnetes Szenario aus den Seeds' : 'Ein neu generiertes Szenario'
  end

  # pretotype
  def boxplot
    File.read(Rails.root.join('public/pretotype/boxplot.json'))
  end
end
