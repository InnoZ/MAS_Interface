class DemoController < ApplicationController
  # to avoid cache problem on touch beamer playing
  skip_before_filter :verify_authenticity_token, only: [:activate_polygon]

  def touch
    # # uncomment this to initially create data
    # # on production postgresql runs as old version 9.3, thus the creation does not work
    # # create data on a machine with postgresql 9.5 or higher!

    save_data_in_file
  end

  def save_data_in_file
    path = 'public/data_demo_scenario.json'
    unless File.file?(path)
      @scenario_a = Scenario.find_by(district_id: '03404')
      File.open(path ,'w') do |f|
        f.write(@scenario_a.json_all.to_json)
      end
    end
  end

  def monitor
  end

  def activate_polygon
    ActionCable.server.broadcast(
      'demo_channel', {
        active_polygon: params[:active_polygon],
        active_mode: params[:active_mode],
        active_mode_name: params[:active_mode_name],
        start_or_end: params[:start_or_end],
      }
    )
  end
end
