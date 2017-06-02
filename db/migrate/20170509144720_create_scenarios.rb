class CreateScenarios < ActiveRecord::Migration[5.0]
  def change
    create_table :scenarios do |t|
      t.string :district_id, null: false
      t.integer :year, null: false
      t.boolean :seed, null: false
      t.timestamps
    end
    add_index(:scenarios, :district_id)
    add_index(:scenarios, :year)
    add_index(:scenarios, [:district_id, :year, :seed], unique: true)
  end
end
