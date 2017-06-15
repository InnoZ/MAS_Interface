class CreateScenarios < ActiveRecord::Migration[5.0]
  def change
    create_table :scenarios do |t|
      t.string :district_id, null: false
      t.integer :year, null: false
      t.integer :population, null: false
      t.integer :population_diff_2017, null: false
      t.integer :bbsr
      t.string 'person_km', array: true, null: false
      t.string 'trips', array: true, null: false
      t.string 'diurnal_curve', array: true, null: false
      t.string 'carbon_emissions', array: true, null: false
      t.boolean :seed, null: false
      t.timestamps
    end
    add_index(:scenarios, :district_id)
    add_index(:scenarios, :year)
    add_index(:scenarios, :population)
    add_index(:scenarios, :population_diff_2017)
    add_index(:scenarios, :person_km)
    add_index(:scenarios, :trips)
    add_index(:scenarios, :diurnal_curve)
    add_index(:scenarios, :carbon_emissions)
    add_index(:scenarios, [:district_id, :year, :seed], unique: true)
  end
end
