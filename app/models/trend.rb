class Trend
  def initialize(scenario_a, scenario_b)
    @scenario_a = scenario_a
    @scenario_b = scenario_b
  end

  # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
  def json
    {
      modal_split: {
        car: difference_rel(
          JSON.parse(@scenario_b.modal_split),
          JSON.parse(@scenario_a.modal_split),
          %w[car],
          'share'
        ),
        pt: difference_rel(
          JSON.parse(@scenario_b.modal_split),
          JSON.parse(@scenario_a.modal_split),
          %w[pt walk bike],
          'share'
        ),
        unit: '%',
      },
      traffic_performance: {
        car: difference_abs(
          @scenario_b.traffic_performance,
          @scenario_a.traffic_performance,
          %w[car],
          'traffic'
        ),
        pt: difference_abs(
          @scenario_b.traffic_performance,
          @scenario_a.traffic_performance,
          %w[pt walk bike],
          'traffic'
        ),
        unit: 'km',
      },
      co2_emissions: {
        car: difference_abs(
          @scenario_b.carbon_emission,
          @scenario_a.carbon_emission,
          %w[car],
          'carbon'
        ),
        pt: difference_abs(
          @scenario_b.carbon_emission,
          @scenario_a.carbon_emission,
          %w[pt walk bike],
          'carbon'
        ),
        unit: 't',
      },
    }
  end

  def difference_rel(data_a, data_b, mode, attribute_name)
    (relative(mode, data_b, attribute_name) - relative(mode, data_a, attribute_name)).round(2)
  end

  def difference_abs(data_a, data_b, mode, attribute_name)
    absolute(mode, data_b, attribute_name) - absolute(mode, data_a, attribute_name)
  end

  def relative(modes, data, attribute_name)
    total = data.map { |i| i[attribute_name] }.sum
    mode_data = data.find { |d| modes.include?(d['mode']) }
    mode_data ? (mode_data[attribute_name].to_f / total * 100) : 0
  end

  def absolute(modes, data, attribute_name)
    mode_data = data.find { |d| modes.include?(d['mode']) }
    mode_data ? mode_data[attribute_name] : 0
  end
end
