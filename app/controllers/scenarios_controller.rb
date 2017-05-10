class ScenariosController < ApplicationController
  def index
    @scenarios = Scenario.all
  end

  def show
    @scenario = Scenario.find(params[:id])
  end

  def new
    @scenario = Scenario.new
    @districts_germany = DistrictsGermany.all.to_json
  end

  def create
    @scenario = Scenario.new(
      district_id: String(scenario_params[:district_id]),
      year: scenario_params[:year],
      json: result
    )
    if @scenario.save
      flash[:success] = 'Szenario erstellt'
      redirect_to scenarios_path
    end
  rescue => e
    flash[:danger] = "Ups, etwas ist schief gegangen => #{e.message}"
    redirect_to :back
  end

  def result
    MatsimStarter.new(String(scenario_params[:district_id]), Integer(scenario_params[:year])).result
  end

  def scenario_params
    params.require(:scenario).permit(:district_id, :year)
  end
end
