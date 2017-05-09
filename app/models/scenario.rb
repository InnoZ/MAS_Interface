class Scenario < ApplicationRecord
  validates :district_id, presence: true, numericality: { only_integer: true }
  validates :year, presence: true, numericality: { only_integer: true }
end
