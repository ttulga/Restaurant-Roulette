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

// url for JSON's GET call
var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=' + key;

// restaurants variable to hold JSON's return data
var restaurants;

$(function() {
	// on load, add click listener to SPIN button
	$('button.spin').click(function(){
		restaurants = getRestaurantData();
	});
}); // doc ready

// Gather query parameters from html, validate, and 
// get the JSON using Google's API
function getRestaurantData() {
	// gather query parameters
	
	queryUrl = url;
	for(var i = 0; i < queryParams.length; i++) {
		// grab each value in the html
		var item = queryParams[i];
		item.value = $('.' + item.name).attr('value');
		
		// convert special cases
		if(item.name == 'location') {
			// convert location from query to lat/long using
			// something like this:
			// https://maps.googleapis.com/maps/api/place/textsearch/json?query=uw+seattle&sensor=true&key=AIzaSyBY55ORyqjG8LaN8_h3KIUQ6QR7WbmRz4A
			// item.value = "lat,long";
		} else if (item.name == 'radius') {
			// convert radius from miles to meters
			radiusInMiles = parseInt(item.value);
			radiusInMeters = radiusInMiles * 1609.34;
			item.value = radiusInMeters;
		}
		
		// append parameters to url
		queryUrl += '&' + item.name + '=' + item.value;
	}
	
	alert(queryUrl);
	
	// validate 
	//var valid = validateParams(queryParams);
	var valid = true;
	
	if(valid){
		$.getJSON(url, function(data){
			alert(data);
			return data;
		});
	} else {
		return false;
	}
}