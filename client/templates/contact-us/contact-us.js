Template.ContactUs.created = function() {
	Session.get('submitted', false);
	Session.get('submitted-error', false);
	Session.get('submitted-success', false);
	// We can use the `ready` callback to interact with the map API once the map is ready.
	GoogleMaps.ready("ourlocation", function(map) {
			// Add a marker to the map once it's ready
			var marker = new google.maps.Marker({
			position: map.options.center,
			map: map.instance
		});
	});
};
Template.ContactUs.helpers({
	mapOptions: function() {
		// Make sure the maps API has loaded
	    if (GoogleMaps.loaded()) {
	      // Map initialization options
	      return {
	        center: new google.maps.LatLng(-33.893762, 18.511223),
	        zoom: 16
	      };
	    }},
    submitError: function() { return Session.get('submitted-error'); },
    submitSuccess: function() { return Session.get('submitted-success'); },
    submitted: function() { return Session.get('submitted'); }
});
Template.ContactUs.events({
	// Used to submit email to admins via
	// 'contact us' form
	"submit": function(e, t) {		
		e.preventDefault();
		// Verify input
		if (!Input_check_errors('joe')) { return; }
		// Get inputs
		var message = {};
		message.name = Session.get("contact-name");
		message.surname = Session.get("contact-surname");
		message.email = Session.get("contact-email");
		message.number = "+27 " + Session.get("contact-number");
		message.query = Session.get("contact-query");
		var date = new Date();
		message.timestamp = date.format("dddd, mmmm d, yyyy");
		// Submit message
		Meteor.call("EMAIL_ContactUsMessage", message, function(err) {
			Session.set('submitted', true);
			if (err) { Session.set('submitted-error', 'Error submitting message: ' + err.error); }
			else { Session.set('submitted-success', 'Successfully submitted your message'); }
		});
		return false;
	},
	// Use to reset the form
	"click .js-send-another": function(e, t) {
		Session.set('submitted', false);
		Session.get('submitted-error', false);
		Session.get('submitted-success', false);
	}
});