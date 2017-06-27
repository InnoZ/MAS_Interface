class ScenariosController < ApplicationController
  def index
    @districts_germany = DistrictsGermany.all.to_json
    @scenarios = Scenario.all
  end

  def show
    unless params[:district] && Scenario.find_by(district_id: params[:district])
      redirect_to :root
    else
      @scenarios = Scenario.where(district_id: params[:district]).order(:year)
      @scenario_a = @scenarios.first
      if params[:year_a].present?
        @scenario_a = Scenario.find_by(year: params[:year_a].to_i)
      end
      if params[:year_b].present?
        @scenario_b = Scenario.find_by(year: params[:year_b].to_i)
      end
    end
  end

  def new
    @scenario = Scenario.new
    @districts_germany = DistrictsGermany.all.to_json
  end

  # rubocop:disable all
  def create
    unless scenario_params[:district_id].present?
      flash[:danger] = 'Bitte Landkreis wählen'
      redirect_to :back
    else
      args = {
        district_id: String(scenario_params[:district_id]),
        year: Integer(scenario_params[:year]),
      }
      @existing_scenario = Scenario.find_by(args)
      if @existing_scenario
        flash[:success] = 'Szenario bereits vorhanden'
        redirect_to scenario_path(@existing_scenario)
      else
        if @scenario = Scenario.make(args)
          flash[:success] = 'Szenario erstellt'
          redirect_to scenario_path(@scenario)
        end
      end
    end
  rescue => e
    flash[:danger] = "Ups, etwas ist schief gegangen => #{e.message}"
    redirect_to :back
  end

  def scenario_params
    params.require(:scenario).permit(:district_id, :year)
  end
end
