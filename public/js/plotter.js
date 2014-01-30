// Constructor
var AUTO_AXIS_Y_NUM = 5;

function PlotCanvas() {
	this.canvas = {};
	this.context = {};
	this.plotData = [];
	this.plotAxes = {
		x1:0, 
		x2:1, 
		y1:0, 
		y2:1
	}
	this.plotType = "line";

	this.settings = {
		lineColor: 			"#aaa",
		lineWidth: 			4,
		
		markerColor: 		"#6ad",
		markerSize: 		10,

		barColor: 			"#6ad",
		barBorderColor: 	"#48b",

		space: 				5,
		padding: 			0.2,

		axisColor: 			"#ddd",
		axisWidth: 			1,
		axisFontColor: 		"#ddd",
		axisFont: 			"20px Arial",
		axisFontSize: 		20,
		axisMode: 			"hor",
		axisXRes: 			1,
		axisYRes: 			1
	}
	
}

// --------------------
// Get-Set
// --------------------

PlotCanvas.prototype.setCanvas = function(c) {
	this.canvas = c;
	this.context = c.getContext("2d");
}

PlotCanvas.prototype.setAxes = function(ref_x1, ref_x2, ref_y1, ref_y2) {
	var x1 = ((ref_x1+ref_x2)/2) + (ref_x1 - ((ref_x1+ref_x2)/2))/(1-this.settings.padding);
	var x2 = ((ref_x1+ref_x2)/2) + (ref_x2 - ((ref_x1+ref_x2)/2))/(1-this.settings.padding);
	var y1 = ((ref_y1+ref_y2)/2) + (ref_y1 - ((ref_y1+ref_y2)/2))/(1-this.settings.padding);
	var y2 = ((ref_y1+ref_y2)/2) + (ref_y2 - ((ref_y1+ref_y2)/2))/(1-this.settings.padding);

	this.plotAxes = {
		x1: x1,
		x2: x2,
		y1: y1,
		y2: y2
	};
}


// --------------------
// Utilities
// --------------------

PlotCanvas.prototype.width2context = function(x,axes) {
	return Math.round(this.canvas.width*x/(axes.x2-axes.x1));
}

PlotCanvas.prototype.height2context = function(y,axes) {
	return Math.round(this.canvas.height*(1 - y/(axes.y2-axes.y1)));
}

PlotCanvas.prototype.cart2context = function(x,y,axes) {
	var contextX = Math.round(this.canvas.width*(x-axes.x1)/(axes.x2-axes.x1));
	var contextY = Math.round(this.canvas.height*(1 - (y-axes.y1)/(axes.y2-axes.y1)));
	return {x: contextX, y:contextY};
}


// --------------------
// Plot elements
// --------------------

PlotCanvas.prototype.drawMarker = function(x, y, axes) {
	this.context.save();
	this.context.fillStyle = this.settings.markerColor;
	this.context.beginPath();
	var contextP = this.cart2context(x,y,axes);
	this.context.arc(contextP.x, contextP.y, this.settings.markerSize, 0, 2*Math.PI);
	this.context.fill();
	this.context.restore();
}

PlotCanvas.prototype.drawLine = function(p1, p2, axes, type) {
	this.context.save();

	if (type == "plot") {
		this.context.strokeStyle = this.settings.lineColor;
		this.context.lineWidth = this.settings.lineWidth;	
	}
	else if (type == "axis") {
		this.context.strokeStyle = this.settings.axisColor;
		this.context.lineWidth = this.settings.axisWidth;		
	}
	
	var contextP1 = this.cart2context(p1.x,p1.y,axes);
	var contextP2 = this.cart2context(p2.x,p2.y,axes);
	this.context.beginPath();
	this.context.moveTo(contextP1.x, contextP1.y);
	this.context.lineTo(contextP2.x, contextP2.y);
	this.context.stroke();
	this.context.restore();
}

PlotCanvas.prototype.drawBar = function(x, y, width, axes) {
	var contextP = this.cart2context(x,y,axes);
	var contextZ = this.cart2context(x,0,axes);
	var contextWidth = this.width2context(width,axes);
	
	this.context.save();

	this.context.fillStyle = this.settings.barColor;
	this.context.rect(contextP.x - contextWidth/2, contextP.y, contextWidth, contextZ.y-contextP.y);
	this.context.fill();

	this.context.strokeStyle = this.settings.barBorderColor;
	this.context.rect(contextP.x - contextWidth/2, contextP.y, contextWidth, contextZ.y-contextP.y);
	this.context.stroke();

	this.context.restore();
}

PlotCanvas.prototype.drawAxes = function(axes) {
	if (this.settings.axisMode == "xy") {

	}
	else if (this.settings.axisMode =="hor") {
		var Y = this.plotAxes.y1 - (this.plotAxes.y1 % this.settings.axisYRes);
		var p1;
		var p2;

		while(Y < this.plotAxes.y2) {
			p1 = {x: this.plotAxes.x1, y:Y};
			p2 = {x: this.plotAxes.x2, y:Y};
			this.context.save();
			this.context.fillStyle = this.settings.axisColor;
			this.drawLine(p1, p2, this.plotAxes, "axis");
			this.context.restore();
			this.drawAxisLabel(this.plotAxes.x1, Y, Y, this.plotAxes);
			Y += this.settings.axisYRes;
		}
	}
}

PlotCanvas.prototype.drawAxisLabel = function(x,y,value,axes) {
	this.context.save();

	this.context.fillStyle = this.settings.axisFontColor;
	this.context.font = this.settings.axisFont;

	var metrics = this.context.measureText(value.toString())
	var contextP = this.cart2context(x,y,axes);
	this.context.fillText(value.toString(), contextP.x + this.settings.space, contextP.y - this.settings.space);
	this.context.restore();

}

// --------------------
// Plot data
// --------------------

PlotCanvas.prototype.clearPlot = function() {
	this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
}

PlotCanvas.prototype.linePlot = function(overrideData) {
	var localData = overrideData || this.data;
	var length = localData.length
	for(var i=0; i<length-1; i++) {
		this.drawLine({x:i, y:localData[i]}, {x:i+1, y:localData[i+1]}, this.plotAxes, "plot");
		this.drawMarker(i, localData[i], this.plotAxes);
	}
	this.drawMarker(length-1, localData[length-1], this.plotAxes);
}

PlotCanvas.prototype.barPlot = function(overrideData) {
	var localData = overrideData || this.data;
	for(var i=localData.length-1; i>=0; i--) {
		this.drawBar(i, localData[i], 1, this.plotAxes);		
	}
}

PlotCanvas.prototype.plot = function(overrideData) {
	var localData = overrideData || this.data;
	this.clearPlot();
	this.drawAxes();
	if (this.plotType == "line") {
		this.linePlot(localData);
	}
	else if (this.plotType == "bar") {
		this.barPlot(localData);
	}
}

PlotCanvas.prototype.autoplot = function(overrideData) {

	var localData = overrideData || this.plotData;

	var x1 = 0;
	var x2 = localData.length-1;
	var y1 = Math.min.apply(null,localData);
	var y2 = Math.max.apply(null,localData);

	if (this.plotType == "bar") {
		ref_y1 = Math.min(y1,0);
		ref_y2 = Math.max(y2,0);
	}

	this.setAxes(x1,x2,y1,y2);
	this.plot(localData);
}