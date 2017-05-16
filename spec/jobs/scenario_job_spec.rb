require 'rails_helper'

RSpec.describe ScenarioJob, type: :job do
  describe '#perform_later' do
    it 'queues a scenario generation' do
      ActiveJob::Base.queue_adapter = :test
      expect { ScenarioJob.perform_later('scenario') }.to enqueue_job
    end

    it 'queues only one job' do
      ActiveJob::Base.queue_adapter = :test
      ScenarioJob.perform_later('scenario')
      expect(ScenarioJob).to have_been_enqueued.exactly(:once)
    end

    it 'queues a scenario with high priority' do
      ActiveJob::Base.queue_adapter = :test
      expect do
        ScenarioJob.set(queue: :high_priority).perform_later('scenario')
      end.to have_enqueued_job.with('scenario').on_queue('high_priority')

      expect do
        ScenarioJob.set(queue: :high_priority).perform_later('scenario')
      end.not_to have_enqueued_job.with('scenario').on_queue('low_priority')
    end

    it 'queues a scenario with low priority' do
      ActiveJob::Base.queue_adapter = :test
      expect do
        ScenarioJob.set(queue: :low_priority).perform_later('scenario')
      end.to have_enqueued_job.with('scenario').on_queue('low_priority')
    end
  end
end
