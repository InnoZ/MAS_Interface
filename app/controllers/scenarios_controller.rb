class ScenariosController < ApplicationController
  def index
    @districts_germany = DistrictsGermany.all.to_json
    @scenarios = Scenario.all
    @available_districts = @scenarios.map(&:scenario_map_infos).to_json
  end

  # rubocop:disable all
  def show
    if params[:district] && Scenario.find_by(district_id: params[:district])
      @scenarios = Scenario.where(district_id: params[:district]).order(:year)
      @scenario_a = params[:year_a].present? ? @scenarios.find_by(year: params[:year_a].to_i) : @scenarios.first
      @scenario_b = params[:year_b].present? ? @scenarios.find_by(year: params[:year_b].to_i) : @scenarios.last
      @scenario_b = nil if @scenario_a == @scenario_b
    else
      redirect_to :root
    end
  end

  def scenario_comparison_data
    @scenario_a = Scenario.find_by(district_id: params[:district_id], year: params[:year_a].to_i)
    @scenario_b = Scenario.find_by(district_id: params[:district_id], year: params[:year_b].to_i)

    trend = Trend.new(@scenario_a, @scenario_b).json
    render json: trend, status: 200
  end

  def scenario_data
    scenario = Scenario.find_by(district_id: params[:district_id], year: params[:year].to_i)
    render json: scenario.json_all.to_json, status: 200
  end

  def new
    @scenario = Scenario.new
    @districts_germany = DistrictsGermany.list.to_json
  end

  # rubocop:disable all
  def create
    unless scenario_params[:district_id].present?
      flash[:danger] = 'Bitte Landkreis wählen'
      redirect_back(fallback_location: root_path)
    else
      args = {
        district_id: String(scenario_params[:district_id]),
        year: Integer(scenario_params[:year]),
      }
      @existing_scenario = Scenario.find_by(args)
      if @existing_scenario
        flash[:success] = 'Szenario bereits vorhanden'
        redirect_to show_district_path(
          district: @existing_scenario.district_id,
          year_a: scenario_params[:year]
        )
      else
        ScenarioJob.set(queue: :high_priority).perform_later(
          scenario_params[:district_id],
          scenario_params[:year].to_i,
          scenario_params[:name],
        )
        flash[:success] = 'Szenario wird erstellt. Bitte haben Sie etwas Geduld.'
        redirect_to scenarios_path
      end
    end
  rescue => e
    flash[:danger] = "Ups, etwas ist schief gegangen => #{e.message}"
    redirect_back(fallback_location: root_path)
  end

  def scenario_params
    params.require(:scenario).permit(:district_id, :year, :year_a, :year_b, :name)
  end
end
