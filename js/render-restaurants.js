// render-restaurants.js
// Group 4 - INFO 343 A
// Restaurant Roulette
//
// ...


// called when a placeSearch function is completed
function renderRestaurants(restaurants) {
	var restaurantsElem = $('.restaurants'); // div container
	
	// clear restaurantsElem's inner HTML
	restaurantsElem.html('<li class="restaurant template"></li>');
	
	// for each restaurant, add it's name to a list
	for(var i = 0; i < restaurants.length; i++) {
		var restaurant = restaurants[i];
		
		var newElem = $('.restaurant.template').clone();
		newElem.html('<strong>' + restaurant.name + '</strong>');
		newElem.removeClass('template');
		
		newElem.appendTo(restaurantsElem);
	}
}