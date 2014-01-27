ActiveRecord::Base.establish_connection(

		:pool => 5,
		:encoding => 'unicode',
		:adapter => 'postgresql',
		:database => 'ehchess_db',
		:host => 'localhost'
)