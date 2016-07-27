;(function($) {

	/* Initialize map */

	function initializeMap(image, settings) {

		var width = image.width;
		var height = image.height;

		var $image = $(image);
		var image_url = $image.attr('src');
		var mapname = $image.attr('usemap').slice(1);
		var map = $('map[name=' + mapname + ']');

		wrapMap(width, height, $image, image_url, mapname, map);
		positionImage($image);
		saveSettings(map, settings);
		saveCoords(map);
		bindEventListeners(mapname);

		resize();
	}

	// Add DOM elements: wrapper, HTML canvas, and a clone of the image to help with positioning
	function wrapMap(width, height, $image, image_url, mapname, map) {
		var wrapperID = $image.attr('id') + 'Wrapper';
		$image.wrap('<div id = "' + wrapperID + '" width="' + width + '" height="' + height + '" class="imw-wrapper" style="display: inline-block; position: relative; line-height: 0; max-width: 100%; height: auto">');
		$('#' + wrapperID)
			.append('<canvas id="' + mapname + 'Canvas" class="imw-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; pointer-events: none;"></canvas>')
			.append('<img id ="' + mapname + 'Clone" class="imw-clone" src="' + image_url + '" style="visibility: hidden; width: 100%; height: auto">');

		map.addClass('imw-map');
	}

	function positionImage($image) {
		$image.addClass('imw-image').css({
			position: "absolute",
			top: "0",
			left: "0",
			height: "auto"
		});
		$image.css("max-width", "100%");
	}

	function saveSettings(map, settings) {
		map.data('_settings', settings);
	}

	function saveCoords(map) {
		map.find('area').each(function() {
			var coords = this.coords.split(',').map(function(x) { return parseInt(x, 10); });
			$(this).data('startCoords', coords);
		});
	}

	function bindEventListeners(mapname) {
		$('map[name=' + mapname + '] area')
			.mouseover(function() {
				drawShape($(this));
			})
			.mouseleave(function() {
				clearCanvas($(this));
			});

		// Resize canvas responsively
		$(window).resize(debounce(resize));
	}

	/* Resize */

	function resize() {
		resizeCanvas();
		resizeMap();
	}

	function resizeCanvas() {
		// The imw-wrapper is already responsive, so set the canvas dimensions
		// to match the wrapper's dimensions
		$('.imw-canvas').each(function() {
			var wrapper = $(this).closest('.imw-wrapper')[0];

			var width = wrapper.getBoundingClientRect().width;
			var height = wrapper.getBoundingClientRect().height;

			var ctx = this.getContext('2d');
			ctx.canvas.width = width;
			ctx.canvas.height = height;
		});
	}

	function resizeMap() {
		$('.imw-map').each(function() {
			var img = $('img[usemap="#' + this.name + '"]')[0];

			var scaleFactor = img.width / img.naturalWidth;

			$(this).find('area').each(function() {
				var coords = $(this).data('startCoords');
				coords = coords.map(function(x) { return x * scaleFactor; });
				this.coords = coords.join(',');
			});

		});
	}

	function debounce(func, timeout) {
		var timeoutId, timeout = timeout || 200;
		return function() {
			var scope = this, args = arguments;
			clearTimeout(timeoutId);
			timeoutId = setTimeout(function() {
				func.apply(scope, Array.prototype.slice.call(args));
			}, timeout);
		}
	}



	/* Canvas drawing functions */

	function clearCanvas(area) {
		var mapname = area.parent().attr('name');
		var canvas = $('#' + mapname + 'Canvas')[0];
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	// Get area coordinates, set canvas settings, and call the appropriate draw function
	function drawShape(area) {
		var map = area.parent();
		var coords = area.attr("coords").split(",").map(function(x) { return parseInt(x, 10); } );
		var shape = area.attr("shape");
		var mapname = map.attr("name");
		var settings = map.data("_settings");

		if (settings.useAreaSettings) {
			var areaSettings = area.data('settings');
			if (areaSettings) {
				areaSettings = JSON.parse(areaSettings.replace(/\'/g, '"'));
				settings = $.extend({}, settings, areaSettings);
			}
		}

		var ctx = $('#' + mapname + 'Canvas')[0].getContext("2d");
		ctx.globalAlpha = settings.fillOpacity;
		ctx.fillStyle = settings.fillColor;

		if (settings.border) {
			ctx.lineWidth = settings.borderWidth;
			ctx.strokeStyle = settings.borderColor;
		}

		switch(shape) {
			case "poly":
				drawPolygon(coords, ctx, settings);
				break;
			case "circle":
				drawCircle(coords, ctx, settings);
				break;
			case "rect":
				drawRectangle(coords, ctx, settings);
				break;
		}
	}

	function drawPolygon(coords, ctx, settings) {
		ctx.beginPath();
		var a, b;
		a = coords[0];
		b = coords[1];
		ctx.moveTo(a, b);
		
		for (var i = 2; i < coords.length; i += 2) {
			a = coords[i];
			b = coords[i+1];
			ctx.lineTo(a, b);
		}

		ctx.closePath();
		ctx.fill();

		if (settings.border) {
			ctx.globalAlpha = settings.borderOpacity;
			ctx.stroke();
		}
	}

	function drawCircle(coords, ctx, settings) {	
		ctx.beginPath();
		ctx.arc(coords[0], coords[1], coords[2], 0, 2 * Math.PI, false);
		ctx.fill();

		if (settings.border) {
			ctx.globalAlpha = settings.borderOpacity;
			ctx.stroke();
		}
	}

	function drawRectangle(coords, ctx, settings) {
		var x = coords[0], y = coords[1], width = coords[2]-coords[0], height = coords[3]-coords[1];
		ctx.fillRect(x, y, width, height);

		if (settings.border) {
			ctx.globalAlpha = settings.borderOpacity;
			ctx.strokeRect(x, y, width, height);
		}
	}


	/* Initialize plugin and defaults */

	$.fn.imageMapWrapper = function(options) {

		var settings = $.extend({}, $.fn.imageMapWrapper.defaults, options);

		return this.filter('img[usemap]').each(function() {
			initializeMap(this, settings);
		});
	}

	$.fn.imageMapWrapper.resize = resize;

	$.fn.imageMapWrapper.defaults = {
		fillColor: "#fff",
		fillOpacity: .7,
		border: false,
		borderWidth: 2,
		borderColor: "#f00",
		borderOpacity: 1,
		useAreaSettings: false
	}

})(jQuery);