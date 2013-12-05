// google-places-manager.js
// Group 4 - INFO 343 A
// Restaurant Roulette
//
// Randomly select a restaurant based on parameters 
// like location, price, rating, etc. using Google's
// Places API (specifically Places Searches)
// https://developers.google.com/places/documentation/

var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?';

var key = 'AIzaSyBY55ORyqjG8LaN8_h3KIUQ6QR7WbmRz4A';

var restaurants;

// should this be in a separate .js file?
var queryParams = [
    {
        "name": "key"
    },
    {
        "name": "location"
    },
    {
        "name": "radius"
    },
    {
        "name": "rankby=",
		"value": "distance"
    },
    {
        "name": "sensor" // must be true or false
    },
	{
		"name": ""
	}
];

// on load, add mouseClicked event to Select button
$(function() {
	add mouseClick event to a select/spin roulette button
}); // doc ready

// Gather query parameters from html, validate, and 
// get the JSON using Google's API
getRestaurantData() {
	// gather query parameters
	for each item in queryParams {
		grabValueFromHTML();
		
		if item is location {
			convertToLatLong()
		} else if item is radius {
			convertToMeters()
		}
		
		url += '&' + itemName + '=' + itemValue;
	}
	
	var valid = validateParams(queryParams);
	
	if valid {
		getJSON(url, function(data){
			restaurants = data;
		});
	}
}