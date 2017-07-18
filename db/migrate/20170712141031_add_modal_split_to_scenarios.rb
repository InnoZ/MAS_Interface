class AddModalSplitToScenarios < ActiveRecord::Migration[5.0]
  def change
    add_column :scenarios, :modal_split, :json
  end
end
