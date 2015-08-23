Meteor.methods({
	UTIL_VerifyAccount: function(userId, token) {
		// Get user
		var user = Meteor.users.findOne({'_id':userId});
		console.log("Verifying account: " + userId + " " + token);
		if (!user.emails[0].verified) {
			if (user.emails[0].verification_token == token) {
				Meteor.users.update({'_id':userId, 'emails.address':user.emails[0].address}, {$set: {
						'emails.$.verified':true
					}
				});
			} else { throw new Meteor.Error("Invalid token."); }
		} else { throw new Meteor.Error("Account has all ready been verified."); }
	},
	UTIL_EmailAvailable: function(email) {
		if (Meteor.users.find({'emails.address':email}).count() > 0) { return false; }
		else { return true; }
	},
	UTIL_SetResetPasswordToken: function(email) {
		Meteor.call("EMAIL_PasswordResetToken", email);
	},
	UTIL_CheckResetPasswordToken: function(userId, token) {
		// Get user
		var user = Meteor.users.findOne({'_id':userId});
		if (user.services.password.pw_verification_token != token) {
			throw new Meteor.Error("Incorrect <i>Password Reset Token</i> provided.");
		}
	},
	UTIL_SetPasswordIfToken: function(userId, token, pw) {
		// Check to see that it matches
		Meteor.call("UTIL_CheckResetPasswordToken", userId, token);
		// Set the password
		Accounts.setPassword(userId, pw);
		// Remove the verification token
		Meteor.users.update({'_id':userId}, {$set: {
				'services.password.pw_verification_token': ''
			}
		});
		if (Roles.userIsInRole(userId, 'job-seeker')) {	return 'job-seeker'; } 
		else if (Roles.userIsInRole(userId, 'employer')) { return 'employer'; }
	}
});