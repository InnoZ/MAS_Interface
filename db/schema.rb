# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170530115506) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"

  create_table "grids", force: :cascade do |t|
    t.string    "district_id",                                                               null: false
    t.integer   "side_length",                                                               null: false
    t.integer   "x",                                                                         null: false
    t.integer   "y",                                                                         null: false
    t.geography "cell",        limit: {:srid=>4326, :type=>"st_polygon", :geographic=>true}, null: false
    t.index ["cell"], name: "index_grids_on_cell", using: :gist
    t.index ["district_id"], name: "index_grids_on_district_id", using: :btree
  end

  create_table "plans", force: :cascade do |t|
    t.string    "agent_id",                                                                       null: false
    t.time      "started_at",                                                                     null: false
    t.time      "ended_at",                                                                       null: false
    t.string    "from_activity_type",                                                             null: false
    t.string    "to_activity_type",                                                               null: false
    t.geography "location_start",     limit: {:srid=>4326, :type=>"st_point", :geographic=>true}, null: false
    t.geography "location_end",       limit: {:srid=>4326, :type=>"st_point", :geographic=>true}, null: false
    t.string    "mode",                                                                           null: false
    t.string    "scenario_id",                                                                    null: false
    t.index ["agent_id"], name: "index_plans_on_agent_id", using: :btree
    t.index ["location_end"], name: "index_plans_on_location_end", using: :gist
    t.index ["location_start"], name: "index_plans_on_location_start", using: :gist
    t.index ["mode"], name: "index_plans_on_mode", using: :btree
    t.index ["scenario_id"], name: "index_plans_on_scenario_id", using: :btree
  end

  create_table "scenarios", force: :cascade do |t|
    t.string   "district_id", null: false
    t.integer  "year",        null: false
    t.boolean  "seed",        null: false
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.index ["district_id", "year", "seed"], name: "index_scenarios_on_district_id_and_year_and_seed", unique: true, using: :btree
    t.index ["district_id"], name: "index_scenarios_on_district_id", using: :btree
    t.index ["year"], name: "index_scenarios_on_year", using: :btree
  end

end
