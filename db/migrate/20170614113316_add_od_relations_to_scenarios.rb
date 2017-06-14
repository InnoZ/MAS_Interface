class AddOdRelationsToScenarios < ActiveRecord::Migration[5.0]
  def change
    add_column :scenarios, :od_relations, :json
  end
end
