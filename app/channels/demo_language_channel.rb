 class DemoLanguageChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'demo_language_channel'
  end
end