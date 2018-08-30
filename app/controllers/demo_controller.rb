class DemoController < ApplicationController
  # to avoid cache problem on touch beamer playing
  skip_before_filter :verify_authenticity_token, only: [:activate_polygon]

  def touch
    @demo_mode_colors = mode_colors
    save_data_in_file
  end

  def monitor
    @demo_mode_colors = mode_colors
  end

  def mode_colors
    {
      'all': '#E8E8E8',
      'car': '#F9402D',
      'ride': '#FF9900',
      'carsharing': '#404CB8',
      'pt': '#00A7F7',
      'bike': '#009788',
      'walk': '#86C540',
      'other': '#E8E8E8',
    }
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

  def demo_ready
    ActionCable.server.broadcast(
      'demo_ready_channel', {
        demo_ready: params[:demo_ready],
      }
    )
  end
end
