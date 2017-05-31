class CreatePlans < ActiveRecord::Migration[5.0]
  def up
    create_table :plans do |t|
      t.string :agent_id, null: false
      t.time :started_at, null: false
      t.time :ended_at, null: false
      t.string :from_activity_type, null: false
      t.string :to_activity_type, null: false
      t.st_point :location_start, geographic: true, srid: 4326, null: false
      t.st_point :location_end, geographic: true, srid: 4326, null: false
      t.string :mode, null: false
      t.string :scenario_id, null: false
    end
    execute <<-SQL
      CREATE INDEX ON plans USING GIST (location_start);
      CREATE INDEX ON plans USING GIST (location_end);
    SQL
  end

  def down
    drop_table :plans

    execute <<-SQL
      DROP INDEX plans_location_start_idx;
      DROP INDEX plans_location_end_idx;
    SQL
  end
end
