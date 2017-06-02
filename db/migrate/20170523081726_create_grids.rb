class CreateGrids < ActiveRecord::Migration[5.0]
  def change
    create_table :grids do |t|
      t.string :district_id, null: false
      t.integer :side_length, null: false
      t.integer :x, null: false
      t.integer :y, null: false
      t.st_polygon :cell, geographic: true, srid: 4326, null: false
    end
    add_index(:grids, :district_id)
    add_index(:grids, :cell, using: 'gist')
  end
end
