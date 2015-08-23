Template.registerHelper('equals', function (a, b) {	
  	return a === b;
});
Template.registerHelper('or', function(a, b) {
	if (a == true || b == true || a.length > 0 || b.length > 0) { return true; }
	return false;
});
Template.registerHelper('equalsor2', function (a, b, c) {
	return a === b || a === c;
});
Template.registerHelper('equalsor3', function (a, b, c, d) {
	return a === b || a === c || a === d;
});
Template.userControls.events({
	"click .js-logout": function(e, t) {
		Meteor.logout(function(err) {
			if (err) { Notify(err.error, "fail"); }
			else { 
				Router.go("Home");
				Notify("Successfully logged out!", "success");
			}
		});
	}
});

// INDEX PAGE
Template.Index.helpers({
	notifications: function() { return Session.get(GLOBAL_NOTIFY); }
});
Template.Index.events({
	"click .js-remove-notification": function(e, t) {
		RemoveNotification(this._id);
	}
});