class CreateScenarios < ActiveRecord::Migration[5.0]
  def change
    create_table :scenarios do |t|
      t.integer :district_id, null: false
      t.integer :year, null: false
      t.json :json, null: false

      t.timestamps
    end
  end
end
