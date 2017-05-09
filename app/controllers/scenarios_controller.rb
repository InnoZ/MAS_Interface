class ScenariosController < ApplicationController
  def select
  end

  def run
    flash[:success] = "Folgendes Szenario wurde gewählt: Jahr #{params[:year]} - GKZ #{params[:district_id]}"
    redirect_back(fallback_location: root_path)
  end
end
