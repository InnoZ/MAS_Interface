class CreatePlans < ActiveRecord::Migration[5.0]
  def change
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
    add_index(:plans, :scenario_id)
    add_index(:plans, :mode)
    add_index(:plans, :agent_id)
    add_index(:plans, :location_start, using: 'gist')
    add_index(:plans, :location_end, using: 'gist')
  end
end
