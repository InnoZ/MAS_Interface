class ScenariosController < ApplicationController
  GEOJSON = Rails.root.join('app', 'assets', 'geo')

  def show
    @scenario = Scenario.find(params[:id])
  end

  def new
    @scenarios = Scenario.all
    @scenario = Scenario.new
    @districts_germany = File.read("#{GEOJSON}/districts_germany.geojson")
  end

  def create
    @scenario = Scenario.new(
      district_id: String(scenario_params[:district_id]),
      year: scenario_params[:year],
      json: result
    )
    if @scenario.save
      flash[:success] = 'Szenario erstellt'
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
