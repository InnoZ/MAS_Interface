class ScenariosController < ApplicationController
  GEOJSON = Rails.root.join('app', 'assets', 'geo')

  def new
    @scenarios = Scenario.all
    @scenario = Scenario.new
    @districts_germany = File.read("#{GEOJSON}/districts_germany.geojson")
    @germany_simple = File.read("#{GEOJSON}/germany_simple.geojson")
  end

  def create
    @scenario = Scenario.new(
      district_id: String(scenario_params[:district_id]),
      year: scenario_params[:year],
      json: result
    )
    if @scenario.save
      flash[:success] = "Folgendes Szenario wurde gewählt: Jahr #{params[:year]} - GKZ #{params[:district_id]}"
      redirect_back(fallback_location: root_path)
    end
  end

  def result
    MatsimStarter.new(String(scenario_params[:district_id]), Integer(scenario_params[:year])).result
  end

  def scenario_params
    params.require(:scenario).permit(:district_id, :year)
  end
end
