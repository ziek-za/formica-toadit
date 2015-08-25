Meteor.methods({
	// Sends verification email with a token
	EMAIL_AccountCreationVerification: function(userId, type) {
		// Get user object
		var user = Meteor.users.findOne({'_id':userId});
		if (_.isUndefined(user)) { return; }
		var email = user.emails[0].address;
		console.log("Sending verification email to (" + email + ")");
		// Identify whether or not the user is a job seeker
		var isJobSeeker = false;
		if (type == 'Job Seeker') { isJobSeeker = true; }
		// Generate token
		var verification_token = GenerateRandomString(16);
		var currentHost = Meteor.absoluteUrl();
		// Get HTML template
		SSR.compileTemplate('Email_AccountVerification', Assets.getText('account-verification.html'));
		var html = SSR.render('Email_AccountVerification', {
			user: user,
			link: currentHost + 'profile/verify/' + userId + '?token=' + verification_token,
			jobSeeker: isJobSeeker
		});
		// Add verification token to user
		Meteor.users.update({'_id':userId, 'emails.address':email}, {$set: {
				'emails.$.verification_token': verification_token
			}
		});
		// Send email
		Email.send({
			from: "no-reply@toadit.com",
			to: email,
			subject: "ToadIT - New Account Verification",
			html: html
		});
	},
	EMAIL_AdminAccountCreationVerification: function(userId, email, password) {
		console.log("Sending admin verification email to (" + email + ")");
		// Get user object
		var user = Meteor.users.findOne({'_id':userId});
		if (_.isUndefined(user)) { return; }
		// Get HTML template
		SSR.compileTemplate('Email_AdminAccountVerification', Assets.getText('account-verification.html'));
		var html = SSR.render('Email_AdminAccountVerification', {
			user: user
		});
		// Send email
		// TODO
	},
	EMAIL_PasswordResetToken: function(email) {
		console.log("Sending reset password to (" + email +")");
		// Get corresponding user from email
		var user = Meteor.users.findOne({'emails.address':email});
		// Check to see if they exist, if not throw an error
		if (_.isUndefined(user)) { throw new Meteor.Error('User with email: <strong>' + email + '</strong> was not found'); }
		// Generate password reset token
		var pw_verification_token = GenerateRandomString(16);
		var isJobSeeker = Roles.userIsInRole(user._id, 'job-seeker');
		var currentHost = Meteor.absoluteUrl();
		// Get HTML template
		SSR.compileTemplate('Email_ResetPassword', Assets.getText('reset-password.html'));
		var html = SSR.render('Email_ResetPassword', {
			user: user,
			jobSeeker: isJobSeeker,
			link: currentHost + 'profile/reset-password/' + user._id + '?token=' + pw_verification_token
		});
		// Add password reset token to users account
		Meteor.users.update({'_id':user._id}, {$set: {
				'services.password.pw_verification_token': pw_verification_token
			}
		});
		// Send email
		Email.send({
			from: "no-reply@toadit.com",
			to: email,
			subject: "ToadIT - Reset Password",
			html: html
		});
	},
	// Used to submit te 'contact us' message
	EMAIL_ContactUsMessage: function(message) {
		console.log("Sending 'contact us' email from (" + message.email + ")");
		// Get HTML template
		SSR.compileTemplate('Email_ContactUs', Assets.getText('contactus-form.html'));
		var html = SSR.render('Email_ContactUs', {
			message: message
		});
		// Send email
		Email.send({
			from: "no-reply@toadit.com",
			to: "contacts@toadit.com",
			subject: "ToadIT - Contact Us Form Submission",
			html: html
		});
	}
 });