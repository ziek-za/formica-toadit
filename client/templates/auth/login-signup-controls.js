Template.Login.created = function() { Session.set('logInError', false); }
Template.Login.rendered = function() { Session.set('logInError', false); }
Template.Login.helpers({
	registerOverlay: function() { return Session.get('registerOverlay'); },
	overlay: function() { return Session.get('overlay'); },
	logInError: function() { return Session.get('logInError'); },
	notifications: function() { return Session.get(GLOBAL_NOTIFY); }
});

Template.Login.events({
	// Submits password reset email
	"click .js-submit-forgotpassword": function(e, t) {
		e.preventDefault();

		var email = t.find(".js-email-forgotpassword").value;
		// Sanitize email address
		// TODO
		// Submit email
		Meteor.call("EMAIL_PasswordReset", email, function(err) {
			if (err) { Notify(err.error, "fail"); }
			else {
				Notify("Email sent to <strong>" + email + "</strong>.", "success");
				Session.set('forgotPasswordOverlay', false);
				Session.set('overlay', false);
			}
		});

		return false;
	},
	// Closes out the registration overlay
	"click .js-close-overlay": function(e, t) {
		Session.set('forgotPasswordOverlay', false);
		Session.set('overlay', false);
		var portal = 
		// Used to convert the session variable name to the correct URL parameter
		// version
		Router.go('Login', {_portal: this.key});
	},
	// Logs the user in
	"submit": function(e, t) {
		e.preventDefault();

		var email = t.find(".js-email").value;
		var password = t.find(".js-password").value;
		if (email == '' || password == '') {
			Session.set('logInError', 'Email and password is required');
			return;
		}
		// Check to see if logging in with correct portal
		var portal = this.key;
		Meteor.call("UTIL_CheckPortalLogin", email, portal, function(err) {
			if (err) {
				Session.set('logInError', err.error);
			} else {
				Meteor.loginWithPassword(email, password, function(err) {
					if (err) { Session.set('logInError', err.error); }
					else { 
						if (portal == 'admin') {
							// Direct to admin home
							Router.go("Admin_Home");
						} else {
							Router.go("Home");
						}
						Notify("Successfully logged in!", "success");
					}
				});
			}
		});
		return false;
	},
	"click .js-remove-notification": function(e, t) {
		RemoveNotification(this._id);
	}
});