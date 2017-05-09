class ScenariosController < ApplicationController
  def select
    @districts_germany = File.read('app/assets/geo/districts_germany.geojson')
    @germany_simple = File.read('app/assets/geo/germany_simple.geojson')
  end

  def run
    flash[:success] = "Folgendes Szenario wurde gewählt: Jahr #{params[:year]} - GKZ #{params[:district_id]}"
    redirect_back(fallback_location: root_path)
    start_matsim
  end

  def start_matsim
    MatsimStarter.new(Integer(params[:district_id]), Integer(params[:year])).start
  end
end
