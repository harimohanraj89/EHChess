class CreatePlayers < ActiveRecord::Migration
  def up
  	create_table :players do |table|
      table.boolean "active"
  		table.string "first_name"
      table.string "last_name"
      table.integer "wins"
      table.integer "losses"
      table.integer "draws"
      table.float "rating"
      table.float "starting_rating"

  		table.timestamps
  	end
  end

  def down
  	drop_table :players
  end
end
