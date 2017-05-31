Sequel.default_timezone = :utc

DB = Sequel.connect(ActiveRecord::Base.connection_config.merge(adapter: 'postgres'))

DB.extension :pg_array

DB.disconnect
