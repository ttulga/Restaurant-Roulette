// google-places-manager.js
// Group 4 - INFO 343 A
// Restaurant Roulette
//
// Randomly select a restaurant based on parameters 
// like location, price, rating, etc. using Google's
// Places API (specifically Places Searches)
// https://developers.google.com/places/documentation/

/*
	TODO
	* align the infowindow popup
	* it's too zoomed in after a search
	* make the location box bigger
	** make the current location marker more unique (change icon maybe?)
	* try using var place = autocomplete.getPlace(); instead of textSearch() fnc
	* filters? -- maybe research about filters is more realistic

	https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete
	autocomplete stuff ^^^
*/

// Cam's Google API key (with Places allowed)
var key = 'AIzaSyBY55ORyqjG8LaN8_h3KIUQ6QR7WbmRz4A';

// restaurants variable to hold JSON's return data
var restaurants;

var infoWindow;
var placemarkers = [];

var marker;


// on load
$(function() {

	// UW's Latitude/Longitude
	var locationUW = new google.maps.LatLng(47.655335, -122.303519);

	// try to get the starting location, but if 
	// they don't allow it (or can't), use UW as
	// the default.
	var location = getStartingLocation();
	if(!location) {
		location = locationUW;
	}

	// set up the map at the determined location
	var map = setupMap(location);

	// set up info window (info popups on mapmarkers)
	infoWindow = new google.maps.InfoWindow();

	// add autocomplete functionality to location
	// input textbox using Google's autocomplete. 
	var input = $('.location')[0];
	var autocomplete = new google.maps.places.Autocomplete(input);

	// make a map marker for current location
	marker = new google.maps.Marker({
		map: map
	});

	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		infoWindow.close();
		marker.setVisible(false);
		var place = autocomplete.getPlace();
		if (!place.geometry) {
			return; // if there's no lat/lng, we're lost!
		}

		map.setCenter(place.geometry.location);
		map.setZoom(17);

		marker.setIcon(({
			url: 'http://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png',
			size: new google.maps.Size(71, 71),
			scaledSize: new google.maps.Size(35, 35),
			anchor: new google.maps.Point(17, 34),
			origin: new google.maps.Point(0, 0)
		}));
		marker.setPosition(place.geometry.location);
		marker.setVisible(true);

		infoWindow.setContent(place.name);
		infoWindow.open(map, marker);
	});

	// add click listener to SPIN button
	$('button.spin').click(function(){
		if ($(".location").val().trim() == "") {
			alert("No location is entered");
			return false;
		}
		restaurants = getRestaurantData(map);
	});
}); // doc ready


// Creates and displays a new Google Map object
// in the HTML element with class="map-container".
// Returns that map object.
function setupMap(location) {
	map = new google.maps.Map($('.map-container')[0], {
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: location,
		zoom: 17 // apparently 17 looks 'good'
	});

	return map;
}


// try to get current location (if they allow us to),
// otherwise, default is returned
function getStartingLocation() {
	var location = false;

	// update the current location if allowed
	// NOTE: This won't work when index.html
	//       is ran as a local file--upload
	//       to web host first.
	navigator.geolocation.getCurrentPosition(function(place) {       
		location = new google.maps.LatLng(place.coords.latitude, place.coords.longitude)
	});

	return location;
}


// Make a Google Map Marker and add it to the
// Map object. Add some relevant information.
function createMarker(latlng, map, icon, content, center,action) {
	var marker = new google.maps.Marker({
		map: map,
		position: latlng,
		content:content,
	});
    if (icon) {
		marker.setIcon(({
			url: icon,
			size: new google.maps.Size(32, 32),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(8, 16),
			scaledSize: new google.maps.Size(16, 16)
		}));
	}   
    if (center) {
		map.setCenter(latlng);
	}

	// Add click listener to show some
	// popup information
	// TODO: pictures, rating, directions button,
	// 		 hours, etc? 
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
function placeSearch(map, request, update) {
	var service = new google.maps.places.PlacesService(map);

	// Now pass the parameters in the request
	// array to the service, and if it returns
	// an OK result, make some markers
	service.search(request, function(results,status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
		
			if(update) {
				var randomIndex = Math.floor(Math.random() * results.length);
				var randRestaurant = results[randomIndex];
			}

			placemarkers = clearMarkers(placemarkers);

			var bounds = new google.maps.LatLngBounds();
			for (var i = 0; i < results.length; ++i) { 
                bounds.extend(results[i].geometry.location);
				if(!update || i == randomIndex) {
					placemarkers.push(createMarker(results[i].geometry.location,
						map,
						results[i].icon,
						//'http://labs.google.com/ridefinder/images/mm_20_orange.png',
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
			}
			map.fitBounds(bounds);

			// Update the restaurants variable to reflect
			// new search results
			if(update) {
				restaurants = results;
				getDetails(randRestaurant.reference);
				renderRestaurants(results);
			}

		} else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
			alert("There were no matching results found. \nPlease expand your query parameters and try again.");
		}
	});     
}


function getDetails(restaurantRef) {
	var service = new google.maps.places.PlacesService(map);

	var request = {
		reference: restaurantRef
	}

	service.getDetails(request, detailsCallback);
}


function detailsCallback(place, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		renderDetailedRestaurant(place);
	}
}


// clears the map markers by rendering
// them invisible and pushing them out
// of the list (placemarkers)
function clearMarkers(placemarkers) {
	for(var i = 0; i < placemarkers.length; i++) {
		placemarkers[i].setVisible(false);
	}
	return []; // placemarkers is returned as empty list
}

// Gather query parameters from html and pass it 
// to the placeSearch function as a request
function getRestaurantData(map) {

	// convert location from text query to 
	// (lat, lng) format by searching Google's
	// places for the location given.
	// TODO: what if they have no results? or
	// 		 too many results?
	textSearch(map, $('.location').val());
}


// Take the query inside the $('.location') element
// and find the lat/lng of that location. Use that in
// a placeSearch query with parameters gathered from
// the HTML for items like radius, rankby, and minprice.
function textSearch(map, query) {
	var request = {
		query: query
	};
	service = new google.maps.places.PlacesService(map);
	service.textSearch(request, function(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			if(results.length > 0) {
				currentLocation = results[0].geometry.location;
			}
		}

		var radiusInMeters = parseInt($('.radius').val()) * 1609.34;	
		// put query parameters into a request object
		var request = {
			location: currentLocation,
			radius: radiusInMeters,
			minPriceLevel: 0,
			maxPriceLevel: parseInt($('.max-price').val()),
			openNow: true,
			types: ['restaurant', 'food', 'cafe', 'meal-takeaway']
		};

		placeSearch(map, request, true);
	});
}