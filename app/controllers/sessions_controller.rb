class SessionsController < ApplicationController
  def create
    user = User.find_by_email(params[:email])
    session[:user_id] = user.id if user && user.authenticate(params[:password])
    redirect_back(fallback_location: root_path)
  end

  def destroy
    session[:user_id] = nil
    redirect_to :root
  end
end
