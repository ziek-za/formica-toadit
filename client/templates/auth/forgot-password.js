Template.ForgotPassword.helpers({
	pageErrors: function() { return Session.get('hjkinput-error'); }
});
Template.ForgotPassword.events({
	// Submit email addrses for resetting
	"submit": function(e, t) {
		e.preventDefault();
		// Check input
		if (!Input_check_errors('hjk')) { return; }
		// Get email address
		var email = Session.get('fyp-email');
		// Reset password if valid email
		var portal = Template.parentData(0).key;
		Meteor.call("UTIL_SetResetPasswordToken", email, function(err) {
			if (err) { Notify("Unable to reset password: " + err.error, "fail"); }
			else { Notify("An email has been sent to <strong>" + email + "</strong>, follow the link inside the email to reset your password.", "success"); }
			Router.go('Login', {_portal: portal});
		});
		return false;
	},
	// Closes overlay
	"click .js-cancel-forgotpassword": function(e, t) { Router.go('Login', {_portal: this.key}); }
});
// RESET PASSWORD
Template.Profile_Resetpassword.created = function() { Session.set('error-msg', false); };
Template.Profile_Resetpassword.helpers({
	errorMsg: function() { return Session.get('error-msg'); }
});
Template.Profile_Resetpassword.events({
	"submit": function(e, t) {
		e.preventDefault();
		var ie = false;
		// Check input
		if (!Input_check_errors('xrb')) { ie = true; }
		// Get variables
		var pw_1 = Session.get('fyp-password-1');
		var pw_2 = Session.get('fyp-password-2');
		// Check input for passwords
		if (pw_1 != pw_2) { ie = true; Session.set('error-msg', 'Passwords do not match.'); }
		if (ie) { return; }
		var userId = Router.current().params._userId;
		var token = Router.current().params.query.token;
		// Reset password
		Meteor.call("UTIL_SetPasswordIfToken", userId, token, pw_1, function(err, portal) {
			if (err) { Notify("Error with resting password: " + err.error, "fail"); Router.go('Home'); }
			else { Notify("Successfully reset your password!", "success"); Router.go('Login', {_portal:portal}); }
		});
		return false;
	}
});