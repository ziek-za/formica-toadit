Meteor.methods({
	// Check to see whether a user is logging into the correct portal
	UTIL_CheckPortalLogin: function(email, portal) {
		var user = Meteor.users.findOne({'emails.address':email});
		if (user) {
			if (!Roles.userIsInRole(user._id, portal)) { throw new Meteor.Error("Incorrect username or password"); }
		}
	}
});