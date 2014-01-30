var ph 			= new PlotCanvas();
var CWIDTH 		= 1280;
var CHEIGHT 	= 480;
var gameLimit 	= 10;

$(function() {
	console.log("hi!")

	var canvas = document.getElementById('player-rating-canvas');
	canvas.width = CWIDTH;
	canvas.height = CHEIGHT;
	ph.setCanvas(canvas);

	var ratings = new Array();

	$.ajax({
		url: '/players/'+playerId+'/ratings.json',
		dataType: 'json',
	})
	.done(function(data) {
	
		if (data.ratings.length > gameLimit) {
			data.ratings = data.ratings.splice(0,gameLimit);
		}
		console.log(data.ratings.reverse())

		ph.setAxes(0,9,0,2500);
		ph.settings.axisYRes = 500;
		ph.plot(data.ratings.reverse());
	})
	
})
	
