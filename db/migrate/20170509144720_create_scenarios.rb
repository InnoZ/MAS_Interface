class CreateScenarios < ActiveRecord::Migration[5.0]
  def change
    create_table :scenarios do |t|
      t.string :district_id, null: false
      t.integer :year, null: false
      t.json :agents, null: false
      t.json :statistics, null: false

      t.timestamps
    end
  end
end
