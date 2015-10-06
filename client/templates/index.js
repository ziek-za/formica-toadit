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
Template.registerHelper('equalsor4', function (a, b, c, d, e) {
	return a === b || a === c || a === d || a === e;
});
Template.registerHelper('isSelf', function (_id) {
	return Meteor.userId() === _id;
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
	notifications: function() { return Session.get(GLOBAL_NOTIFY); },
	// Used to show the index page notification for editting/completing job-seeker details
	profileDetailsPending: function() {
		var user = Meteor.user();
		if (Roles.userIsInRole(Meteor.userId(), 'job-seeker') && 
			user.profile.status === "details pending") { return true; }
		return false;
	}
});
Template.Index.events({
	"click .js-remove-notification": function(e, t) {
		RemoveNotification(this._id);
	}
});