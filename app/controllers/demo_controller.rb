class DemoController < ApplicationController
  # to avoid cache problem on touch beamer playing
  skip_before_filter :verify_authenticity_token, only: [:activate_polygon]

  def touch
    # # uncomment this to initially create data
    # # on production postgresql runs as old version 9.3, thus the creation does not work and postprocessing script is reverted to older version.
    # # create data on an other machone with commit https://github.com/InnoZ/MAS_Interface/commit/bc0f1e402432ff5f42adbf01dff0ea03fc2ae54a#diff-20a01b73b9de597984d1b200e2a44343
    # # or update postgresql to at least 9.5!

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
