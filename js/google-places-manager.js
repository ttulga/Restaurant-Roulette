// google-places-manager.js
// Group 4 - INFO 343 A
// Restaurant Roulette
//
// Randomly select a restaurant based on parameters 
// like location, price, rating, etc. using Google's
// Places API (specifically Places Searches)
// https://developers.google.com/places/documentation/

// Cam's Google API key (with Places allowed)
var key = 'AIzaSyBY55ORyqjG8LaN8_h3KIUQ6QR7WbmRz4A';

// restaurants variable to hold JSON's return data
var restaurants = [];

var infoWindow;
var placemarkers = [];


// on load
$(function() {

	// set up map (defaulted to center on UW)
	// and update map if current location is given
	var locationUW = new google.maps.LatLng(47.655335, -122.303519);
	setupMap(locationUW);

	// add click listener to SPIN button
	$('button.spin').click(function(){
		restaurants = getRestaurantData();
	});
}); // doc ready


// Creates and displays a new Google Map object
// in the HTML element with class="map-container".
// Default centered on UW, but recenters if 
// the user's location is shared.
function setupMap(location) {
	var location = location;
	map = new google.maps.Map($('.map-container')[0], {
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: location,
		zoom: 15
	});
	infoWindow = new google.maps.InfoWindow();

	// update the current location if allowed
	navigator.geolocation.getCurrentPosition(function(place) {       
		location = new google.maps.LatLng(place.coords.latitude, 
			place.coords.longitude)
		// make a marker for the current location
		createMarker(location, 
			map,
			null,
			'Your current position',
			true,
			{
				fnc:function() {
					infoWindow.open();
				}
			}
		);
	}, function() {
		// make a marker for the current location
		createMarker(location, 
			map,
			null,
			'UW (Default Location)',
			true,
			{
				fnc:function() {
					infoWindow.open();
				}
			}
		);
	});

	// default search
	placeSearch(map, {
		radius: 1000, // meters
		types: ['restaurant', 'food', 'cafe', 'meal-takeaway'],
		opennow: true,
		minprice: 1,
		rankby: 'distance',
		location: location
	});
}


// Make a Google Map Marker and add it to the
// Map object. Add some relevant information.
function createMarker(latlng, map, icon, content, center,action) {
	var marker = new google.maps.Marker({
		map: map,
		position: latlng,
		content:content
	});
    if (icon) {
		marker.setIcon(icon);
	}   
    if (center) {
		map.setCenter(latlng);
	}
        
	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.setContent(this.content);
		infoWindow.open(map, this);
	});
        
	if (action) {
		action.fnc(map,action.args);
	}
	return marker;
}

// search for places using PlacesService with
// the Google Map object. We can specify params
// like types (ie. restaurant), radius, opennow, 
// etc.
function placeSearch(map, request) {
	var service = new google.maps.places.PlacesService(map);
	service.search(request, function(results,status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			var bounds = new google.maps.LatLngBounds();
			for (var i = 0; i < results.length; ++i) { 
                bounds.extend(results[i].geometry.location);
            	placemarkers.push(createMarker(results[i].geometry.location,
            		map,
					'http://labs.google.com/ridefinder/images/mm_20_orange.png',
					results[i].name,
					false,
					{
						fnc:function() 
						{
							infoWindow.open();
						}
					})
        		);
			}
		map.fitBounds(bounds);
		return results;
		}
	});     
}


// Gather query parameters from html and get the 
// JSON using Google's API
function getRestaurantData() {

	// gather query parameters
	queryUrl = url;
	for(var i = 0; i < queryParams.length; i++) {
		// grab each value in the html by using
		// the matching class names
		//   ie: location's query value will be 
		//   whatever has a class="location"
		var item = queryParams[i];
		item.value = $('.' + item.name).val();
		
		// convert special cases
		if(item.name == 'location') {
			// location needs to be in 
			// ("float","float") for lat/long
			item.value = convertToLatLong(item.value)
		} else if (item.name == 'radius') {
			// convert radius from miles to meters
			radiusInMiles = parseInt(item.value);
			radiusInMeters = radiusInMiles * 1609.34;
			item.value = radiusInMeters;
		}		
	}
}