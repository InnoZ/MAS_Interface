class AddDensityCountToScenarios < ActiveRecord::Migration[5.0]
  def change
    add_column :scenarios, :density_count, :json
  end
end
