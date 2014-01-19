class CreateGames < ActiveRecord::Migration
  def up
  	create_table :games do |table|
  		table.integer "white_id"
      table.integer "black_id"
      table.integer "white_rating"
  		table.integer "black_rating"
  		table.string "winner"
      table.string "comments"
      
  		table.timestamps
  	end
  end

  def down
  	drop_table :games
  end
end
