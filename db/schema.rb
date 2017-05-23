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

ActiveRecord::Schema.define(version: 20170523081726) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"

  create_table "grids", force: :cascade do |t|
    t.string    "district_id",                                                               null: false
    t.integer   "side_length",                                                               null: false
    t.integer   "x",                                                                         null: false
    t.integer   "y",                                                                         null: false
    t.geography "cell",        limit: {:srid=>4326, :type=>"st_polygon", :geographic=>true}, null: false
    t.index ["cell"], name: "grids_cell_idx", using: :gist
  end

  create_table "scenarios", force: :cascade do |t|
    t.string   "district_id", null: false
    t.integer  "year",        null: false
    t.json     "agents",      null: false
    t.json     "statistics",  null: false
    t.boolean  "seed",        null: false
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

end
