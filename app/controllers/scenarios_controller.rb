class ScenariosController < ApplicationController
  def index
    @districts_germany = DistrictsGermany.all.to_json
    @scenarios = Scenario.all
  end

  def show
    @scenario = Scenario.find(params[:id])
  end

  def new
    @scenario = Scenario.new
    @districts_germany = DistrictsGermany.all.to_json
  end

  # rubocop:disable MethodLength, AbcSize
  def create
    if !scenario_params[:district_id].present?
      flash[:danger] = 'Bitte Landkreis wählen'
      redirect_to :back
    else
      matsim
      @scenario = Scenario.find_by(
        district_id: String(scenario_params[:district_id]),
        year: scenario_params[:year],
        seed: false
      )
      # check if scenario exists and the system process exited correctly
      if !@scenario.nil? && matsim
        unless Grid.find_by(district_id: @scenario.district_id, side_length: Grid.default_side_length)
          GridFill.new(scenario: @scenario, side_length: Grid.default_side_length).run
        end
        flash[:success] = 'Szenario erstellt oder bereits vorhanden'
        redirect_to scenario_path(@scenario)
      end
    end
  rescue => e
    flash[:danger] = "Ups, etwas ist schief gegangen => #{e.message}"
    redirect_to :back
  end

  def matsim
    @matsim ||= MatsimStarter.new(String(scenario_params[:district_id]), Integer(scenario_params[:year]))
  end

  def scenario_params
    params.require(:scenario).permit(:district_id, :year)
  end
end
