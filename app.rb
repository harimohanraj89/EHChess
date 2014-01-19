require 'bundler/setup'
Bundler.require()

require_relative 'models/game'
require_relative 'models/player'
require_relative 'config'

# ROOT
get '/' do
	@latest_games = Game.order(created_at: :desc).limit(5);
	@leaderboard = Player.order(rating: :desc).limit(5);
	erb:index
end


# GAMES
get '/games' do
	@all_games = Game.order(created_at: :desc)
	erb:games
end

post '/games' do
	game = Game.new
	game.white_id = params[:white_id]
	game.black_id = params[:black_id]
	game.winner = params[:winner]

	white_player = Player.find(params[:white_id])
	black_player = Player.find(params[:black_id])

	game.white_rating = white_player.rating
	game.black_rating = black_player.rating

	if game.save

		if params[:winner] == "white"
			white_player.wins += 1;
			black_player.losses += 1;
		elsif params[:winner] == "black" 
			white_player.losses += 1;
			black_player.wins += 1;
		elsif params[:winner] == "draw"
			white_player.draws += 1;
			black_player.draws += 1;
		end

		new_ratings = updateRatings(white_player.rating, black_player.rating, params[:winner])
		white_player.rating = new_ratings[:white]
		black_player.rating = new_ratings[:black]

		white_player.save
		black_player.save
	end

	redirect '/'
end

get '/games/submit' do
	@players = Player.where(active: true).order(last_name: :asc)
	erb:submit
end

get '/games/:id' do
	"This is game number #{params[:id]}"
end

post '/games/:id' do
	game = Game.find(params[:id])

	white_player = Player.where({:id => game.white_id})
	black_player = Player.where({:id => game.black_id})

	if game.winner == "white"
		white_player.each do |white|
			white.wins -= 1;
		end
		black_player.each do |black|
			black.losses -= 1;
		end
	elsif game.winner == "black" 
		white_player.each do |white|
			white.losses -= 1;
		end
		black_player.each do |black|
			black.wins -= 1;
		end
	elsif game.winner == "draw"
		white_player.each do |white|
			white.draws -= 1;
		end
		black_player.each do |black|
			black.draws -= 1;
		end
	end

	white_player.each do |white|
		white.save
	end
	black_player.each do |black|
		black.save
	end

	game.destroy
	fullUpdateRatings
	
	redirect '/games'
end


# PLAYERS
get '/players' do
	@all_players = Player.where(active: true).order(rating: :desc)
	erb:players
end

post '/players' do

	existing_player = Player.where({first_name: params[:first_name], last_name: params[:last_name]})
	if existing_player.length == 1
		existing_player.each do |player|
			player.active = true
			player.save
		end
		redirect '/players'
	else
		player = Player.new

		player.first_name = params[:first_name]
		player.last_name = params[:last_name]
		player.wins = 0;
		player.losses = 0;
		player.draws = 0;
		player.rating = params[:rating]
		player.starting_rating = params[:rating]
		player.active = true
		
		player.save
		redirect '/players'
	end
end

get '/players/add' do
	erb:addplayer
end

get '/players/:id' do
	@player = Player.find(params[:id])
	@recent_games = Game.where("white_id = ? OR black_id = ?", params[:id], params[:id])

	@games = @player.wins+@player.draws+@player.losses
	if @games > 0
		@winp = "#{(@player.wins*100/@games).to_i()}%";
		@drawp = "#{(@player.draws*100/@games).to_i()}%";
		@lossp = "#{(@player.losses*100/@games).to_i()}%";
	else
		@winp = "N/A"
		@drawp = "N/A"
		@lossp = "N/A"
	end

	erb:player
end

post '/players/:id' do
	player = Player.find(params[:id])
	player.active = false
	player.save

	redirect '/players'
end

get '/players/:id/edit' do
	@player = Player.find(params[:id])
	erb:playeredit
end

post '/players/:id/edit' do
	player = Player.find(params[:id])
	player.first_name = params[:first_name]
	player.last_name = params[:last_name]

	player.save
	redirect '/players'
end

get '/players/:id/override' do
	@player = Player.find(params[:id])
	erb:playeroverride
end

post '/players/:id/override' do
	player = Player.find(params[:id])
	if params[:active] == "true"
		player.active = true
	elsif params[:active] == "false"
		player.active = false
	end
	player.first_name = params[:first_name]
	player.last_name = params[:last_name]
	player.rating = params[:rating]
	player.wins = params[:wins]
	player.losses = params[:losses]
	player.draws = params[:draws]
	
	player.save
	redirect '/players'
end

get '/test' do
	"Hi there!"
end

def updateRatings(white_rating, black_rating, winner)
	q_white = 10.0 ** (white_rating/400)
	q_black = 10.0 ** (black_rating/400)
	e_white = q_white / (q_white+q_black)
	e_black = q_black / (q_white+q_black)

	if winner == "white"
		s_white = 1
	elsif winner == "black"
		s_white = 0
	elsif winner == "draw"
		s_white = 0.5
	else
		s_white = e_white
	end

	new_white_rating = white_rating + 32*(s_white-e_white)
	new_black_rating = black_rating - 32*(s_white-e_white)

	return {
			:white => new_white_rating, 
			:black => new_black_rating 
		   }

end

def fullUpdateRatings
	resetPlayerRatings

	games = Game.order(created_at: :asc)
	games.each do |game|
		white_player = Player.find(game.white_id)
		black_player = Player.find(game.black_id)

		new_ratings = updateRatings(white_player.rating, black_player.rating, game.winner)

		white_player.rating = new_ratings[:white]
		black_player.rating = new_ratings[:black]

		white_player.save
		black_player.save
	end
end

def resetPlayerRatings
	players = Player.all
	players.each do |player|
		player.rating = player.starting_rating
		player.save
	end
end