class Grid < ApplicationRecord
  validates :district_id, presence: true
  validates :side_length, presence: true, numericality: { only_integer: true }
  def self.default_side_length
    1_000
  end
end
