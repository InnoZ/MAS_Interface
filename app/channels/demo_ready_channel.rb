 class DemoReadyChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'demo_ready_channel'
  end
end