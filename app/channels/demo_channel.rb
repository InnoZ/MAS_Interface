 class DemoChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'demo_channel'
  end
end