Accounts.validateLoginAttempt(function(options) {
  if (options.error) {
  	if (options.error.reason == "Incorrect password" ||
  		options.error.reason == "User not found") {
  		throw new Meteor.Error("User not found or incorrect password");
  	} else { throw new Meteor.Error(options.error.reason); }
  }
  // Check to see if their account is validated / they are an admin
  var user = options.user;
  if (!_.contains(user.roles, "admin")) {
  	if (!user.emails[0].verified) {
  		throw new Meteor.Error("Your account is not verified. Do so before logging in.");
  	}
  }
  return true;
});