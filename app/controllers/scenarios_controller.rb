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
      @scenario_a = @scenarios.first
      @scenario_b = @scenarios.last unless @scenarios.first == @scenarios.last
      if params[:year_a].present?
        @scenario_a = @scenarios.find_by(year: params[:year_a].to_i)
      end
      if params[:year_b].present?
        @scenario_b = @scenarios.find_by(year: params[:year_b].to_i)
      end
      if @scenario_a && @scenario_b
        @trend = Trend.new(@scenario_a, @scenario_b).json
      end
    else
      redirect_to :root
    end
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
    params.require(:scenario).permit(:district_id, :year, :name)
  end
end
