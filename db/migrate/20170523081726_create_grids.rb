class CreateGrids < ActiveRecord::Migration[5.0]
  def up
    create_table :grids do |t|
      t.string :district_id, null: false
      t.integer :side_length, null: false
      t.integer :x, null: false
      t.integer :y, null: false
      t.st_polygon :cell, geographic: true, srid: 4326, null: false
    end
    execute <<-SQL
      CREATE INDEX ON grids USING GIST (cell);
    SQL
  end

  def down
    drop_table :grids

    execute <<-SQL
      DROP INDEX grids_cell_idx;
    SQL
  end
end
