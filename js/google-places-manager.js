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
var restaurants;

var infoWindow;
var placemarkers = [];


// on load
$(function() {

	// set up map (defaulted to center on UW)
	// and update map if current location is given
	var locationUW = new google.maps.LatLng(47.655335, -122.303519);
	var map = setupMap(locationUW);

	// add click listener to SPIN button
	$('button.spin').click(function(){
		restaurants = getRestaurantData(map);
	});
}); // doc ready


// Creates and displays a new Google Map object
// in the HTML element with class="map-container".
// Default centered on UW, but recenters if 
// the user's location is shared.
function setupMap(location) {
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
	// set the current location to UW if device's
	// current location is NOT allowed
	}, function() {
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

	// default places search to show open
	// restaurants within 1km of starting
	// location (default: UW or geolocation)
	placeSearch(map, {
		radius: 1000, // meters
		types: ['restaurant', 'food', 'cafe', 'meal-takeaway'],
		opennow: true,
		minprice: 1,
		rankby: 'distance',
		location: location
	}, false);

	return map;
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

		// Update the restaurants variable to reflect
		// new search results
		if(update) {
			restaurants = results;
			alert('Found ' + results.length + ' results.');
			for(var i = 0; i < results.length; i++) {
				alert(results[i].name + '\n' + results[i].rating + '\n' + (i+1) + '/' + results.length)
			}
		}

		}
	});     
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
			rankby: $('.rankby').val(),
			minprice: $('.minprice').val(),
			opennow: true,
			types: ['restaurant', 'food', 'cafe', 'meal-takeaway']
		};

		placeSearch(map, request, true);
	});
}