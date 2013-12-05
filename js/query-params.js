// query-params.js
// Group 4 - INFO 343 A
// Restaurant Roulette
//
// parameters from Google's Places Searches API used
// for a restaurant roulette webapp
// https://developers.google.com/places/documentation/

var queryParams = [
    {
        "name": "location"
    },
    {
        "name": "radius"
    },
    {
        "name": "rankby",
		"value": "prominence"
    },
    {
        "name": "sensor", // must be true or false
		"value": "false"
    },
	{
		"name": "opennow",
		"value": "true"
	},
	{
		"name": "types",
		"value": "cafe|food|meal_takeaway|restaurant"
	},
	{
		"name": "minprice"
	}
];
