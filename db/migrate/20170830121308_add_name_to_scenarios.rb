class AddNameToScenarios < ActiveRecord::Migration[5.0]
  def change
    add_column :scenarios, :name, :text
  end
end
