class UserConstraint
  def matches?(request)
    request.session[:user_id] && User.find(request.session[:user_id])
  end
end
