class DemoController < ApplicationController
  # to avoid cache problem on touch beamer playing
  skip_before_filter :verify_authenticity_token, only: [:activate_polygon]

  def touch
    # # uncomment this to initially create data

    # @scenario_a = Scenario.find_by(district_id: '03404')
    # File.open("public/data_demo_scenario.json","w") do |f|
    #   f.write(@scenario_a.json_all.to_json)
    # end
    # File.open("public/od_relations_demo_scenario.json","w") do |f|
    #   f.write(@scenario_a.od_relations)
    # end

    @data_demo_scenario = JSON.parse(File.read('public/data_demo_scenario.json'))
    @od_relations_demo_scenario = JSON.parse(File.read('public/od_relations_demo_scenario.json'))
  end

  def monitor
    @data_demo_scenario = JSON.parse(File.read('public/data_demo_scenario.json'))
    @od_relations_demo_scenario = JSON.parse(File.read('public/od_relations_demo_scenario.json'))
  end

  def activate_polygon
    ActionCable.server.broadcast(
      'demo_channel', {
        active_polygon: params[:active_polygon],
        active_mode: params[:active_mode],
        active_mode_name: params[:active_mode_name],
      }
    )
  end
end
