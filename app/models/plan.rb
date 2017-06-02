class Plan < ApplicationRecord
  validates :scenario_id, presence: true
end
