(function() {
	/**
	 * Back key event handler
	 */
	window.addEventListener('tizenhwkey', function(ev) {
		if (ev.keyName === "back") {
			var page = document.getElementsByClassName('ui-page-active')[0],
				pageid = page ? page.id : "";
			if (pageid === "main") {
				try {
					tizen.application.getCurrentApplication().exit();
				} catch (ignore) {
				}
			} else {
				window.history.back();
			}
		}
	});
}());


const game = function() {
	var interval;
	var dev_id;
	var game_id;
	var foxes_found = 0;
	
	function generate_id() {
		words = ["seoul", "moscow", "montreal", "dublin"];
		
		const id = words[Math.floor(Math.random() * 4)] + Math.floor(Math.random() * 1000);
		
		console.log(id)
		return id;
	}
	
	function init() {
		dev_id = generate_id();
		
		$.ajax({
			type: 'POST',
			data: {
				device_id: 3
			},
			url: "http://83.69.213.178:8082/init",
			dataType: 'json',
			success: function(response) {
				console.log("Init response received: " + response.game_id);
				
				game_id = response.game_id;
				setupUpdates()
			}
		});
		
		console.log("Init request sent")
	}
	
	function errorHandler(err) {
		console.log(err);
        $("distance-text").val("CALAMITY!");
	}
	
	function setupUpdates() {
		if (navigator.geolocation) {
	        WATCH_ID = navigator.geolocation.watchPosition(function(pos) {
	        	$.ajax({
	    			type: 'POST',
	    			url: "http://83.69.213.178:8082/check_point",
	    			dataType: 'json',
	    			data: {
	    				game_id: game_id,
	    				point: pos.coords
	    			},
	    			success: handleUpdate
	    		});
	        	
	        	console.log("Update request sent");
	        }, errorHandler);
	    } else {
	        errorHandler("geolocation not found");
	    }	
	}
	
	function registerFound() {
		foxes_found++;
		$("#img" + foxes_found).show();
	}
	
	function handleUpdate(response) {
		console.log("Update response received: " + response.status);		
		
		if (response.status == "ok") {
			$("#distance-text").text(response.distance);
		}
		else {
			if (response.status == "found") {
				registerFound()
			}
			
			$("#distance-text").text(response.status);
		}
	}
		
	return {
		start : function () {
			init();
		},
	
		stop : function () {
			clearInterval(interval);
		}
	}
}()