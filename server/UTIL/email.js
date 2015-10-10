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
		//userId == newly created admin ID
		console.log("Sending admin verification email to (" + email + ")");
		// Get user object
		var user = Meteor.users.findOne({'_id':userId});
		if (_.isUndefined(user)) { return; }
		var currentHost = Meteor.absoluteUrl();
		// Get HTML template
		SSR.compileTemplate('Email_AdminAccountVerification', Assets.getText('account-verification-admin.html'));
		var html = SSR.render('Email_AdminAccountVerification', {
			email: email,
			password: password,
			link: currentHost + 'login/admin'
		});
		// Send email
		Email.send({
			from: "no-reply@toadit.com",
			to: email,
			subject: "ToadIT - Admin Login Details",
			html: html
		})
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
	},
	// Used to request profile details
	// employer -> admin
	EMAIL_RequestProfileViewing: function(jobseekerId) {
		var employerId = Meteor.userId();
		if (!Roles.userIsInRole(employerId, 'employer')) { throw new Meteor.Error("You are not an employer"); }
		var employer = Meteor.users.findOne({'_id':employerId});
		var jobseeker = Meteor.users.findOne({'_id':jobseekerId});
		// get employers email
		console.log("Sending 'employer request' email from (" + employer.emails[0].address + ")");
		var currentHost = Meteor.absoluteUrl();
		// Get HTML template
		SSR.compileTemplate('Email_RequestJobSeeker', Assets.getText('request-jobseeker.html'));
		var html = SSR.render('Email_RequestJobSeeker', {
			employerProfileLink:currentHost + 'profile/' + employerId,
			jobseekerProfileLink:currentHost + 'profile/' + jobseekerId,
			jobSeekerDetails: jobseeker,
			employerDetails:employer,
			employerEmail:employer.emails[0].address,
			date: new Date()
		});
		// Send email
		Email.send({
			from: "no-reply@toadit.com",
			to: "info@toadit.com",
			subject: "ToadIT - [" + employer.profile.company_details.name + "] request for [" + jobseeker.profile.personal_details.name + " " + jobseeker.profile.personal_details.surname + "]",
			html: html
		}, function(err) {
			if (!err) {
				// Log request to employers account
				Meteor.users.update({'_id':employerId, 'profile.requests._id':jobseekerId}, {$set: {
						'profile.requests.$': {
							'_id': jobseekerId,
							'date': new Date()
						}
					}
				},
				function(err, length) {
					if (length == 0) {
						// there hasnt been a request for this user before
						Meteor.users.update({'_id':employerId}, {$push: {
							'profile.requests': {
								'_id': jobseekerId,
								'date': new Date()
							}
						}});
					}
				});
				// Log request to job seekers account
				Meteor.users.update({'_id':jobseekerId}, {$inc: {
					'profile.requests':1
				}});
			}
		});
	},
	// Used to notify administration of users whom contracts are expiring
	TASK_NotifyExpiringContracts: function() {
		console.log("Sending 'contract expiry' email");
		// Get contracts details
        // Get contracts which expire within 3 months time
        var date = new Date(); date.setMonth(date.getMonth() + 3);
        var selector = {
            $and: [
                {'profile.status': 'placed'},
                {'profile.progress.deployment.end': {$lt: date}},
                {'profile.progress.deployment.end': {$gt: new Date()}}
            ]
        };
        var options = {sort: {'profile.progress.deployment.end': 1}};
        var contracts = Meteor.users.find(selector, options).fetch();
		// Get HTML template to send
		SSR.compileTemplate('Email_ExpringContracts', Assets.getText('expiring-contracts.html'));
		var html = SSR.render('Email_ExpringContracts', {
			contracts: contracts
		});
		// Send emailqu
		Email.send({
			from: "no-reply@toadit.com",
			to: "contacts@toadit.com",
			subject: "ToadIT - Expiring Contracts",
			html: html
		})
	}
 });