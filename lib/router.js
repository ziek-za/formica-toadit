Router.configure({
    layoutTemplate: 'Index'
    /*loadingTemplate: 'loader',
    notFoundtemplate: 'notFound',
    waitOn: function() {
        return [
            Meteor.subscribe('userProfile', Meteor.userId()),
            Meteor.subscribe('notification')
        ];
    }*/
});

// HOME PAGE
Router.route('/',
 	{ 	name: 'Home',
 		template: 'Home',
 		onBeforeAction: function() {
 			// Once the user is logged in, the home page should display a
 			// search field
 			var userId = Meteor.userId();
 			// Job seeker gets search results for employers
 			if (Roles.userIsInRole(userId, 'job-seeker')) { Router.go('Search', {}, {'query': 'type=employer'}); }
 			// Employers get search results for job seekers
 			else if (Roles.userIsInRole(userId, 'employer')) { Router.go('Search', {}, {'query': 'type=job-seeker'}); }
 			this.next();
 		}
 	}
);
// ABOUT US
Router.route('/about-us', 
	{ name: 'AboutUs' }
);
// CONTACT US
Router.route('/contact-us', {
		name: 'ContactUs',
		onBeforeAction: function() { GoogleMaps.load(); this.next(); }
	}
);
// LOGIN / REGISTER
Router.route('/login/:_portal',
	{ 	name: 'Login',
		layoutTemplate: 'Login',
		data: function() {
			// Login portal session
			if (this.params._portal == "job-seeker") {
				return {'key':'job-seeker', 'value':'Job Seeker'};
			} else if (this.params._portal == "employer") {
				return {'key':'employer', 'value':'Employer'};
			} else if (this.params._portal == "admin") {
				return {'key':'admin', 'value':'Admin'};
			}
		},
		action: function() {
			Session.set('overlay', false);
			Session.set('registerOverlay', false);
			// Sets overlay
			if (this.params.query.registrationSuccess == "true") {
				Session.set('overlay', true);
				Session.set('registerOverlay', true);
				this.render('Registration_Conf', {to: 'overlay'});
			} else if (this.params.query.register == "true") {
				Session.set('overlay', true);
				Session.set('registerOverlay', true);
				if (this.params._portal == "job-seeker") {
					this.render('Register_JS', {to: 'overlay'});	
				} else if (this.params._portal == "employer") {
					this.render('Register_Emp', {to: 'overlay'});
				}
			} else if (this.params.query.forgotPassword == "true") {
				Session.set('overlay', true);
				Session.set('registerOverlay', true);
				this.render('ForgotPassword', {to: 'overlay'});
			}
 		}
	}
);
	// CONFIRMATION PAGE
	// -- not in use anymore -- 
	Router.route('/login/confirmation/:_userId', {
		name: 'Registration_Conf',
		layoutTemplate: 'Registration',
		data: function() { return Meteor.users.findOne({'_id':this.params._userId}); },
		waitOn: function() { return Meteor.subscribe('profile', this.params._userId); }
	});
// WHY US
	// EMPLOYER
	Router.route('/why-us/employer',
		{ name: 'WhyUs_Emp' }
	);
	// JOB SEEKER
	Router.route('/why-us/job-seeker',
		{ name: 'WhyUs_JS' }
	);
// SEARCH
	// Search for EMPLOYER
	Router.route('/search',
		{ 	name: 'Search',
		 	onBeforeAction: function() {
		 		// Validate that the user is an employer/job seeker/admin
		 		// and thus authorized to search
		 		var userId = Meteor.userId();
		 		if (!userId) { Router.go('Home'); }
		 		var type = this.params.query.type;		 		
		 		if (type == "job-seeker") {
	 				Session.set('searchType', 'job-seeker');
	 				var default_salary = {
			 			from: 0,
			 			to: Number.MAX_SAFE_INTEGER
			 		}
		 			Session.set('search', {
		 				query: '',
		 				province: '',
		 				position: { current: '', desired: ''},
		 				// job-seekers
						current_salary: default_salary,
						moveFor_salary: default_salary,
						ideal_salary: default_salary,
						userId: Meteor.userId(),
						type: { active: true, pending: '', placed: '' }
		 			});
		 		} else if (type == "employer") {
	 				Session.set('searchType', 'employer');
	 				Session.set('search', {
	 					query: '',
	 					province: '',
	 					userId: Meteor.userId()
	 				});
		 		} else { this.render("four-oh-four"); }
 				this.next();
		 	},
		 	waitOn: function() {
		 		return Meteor.subscribe('roles');
		 	}
		}
	);
// PROFILE
Router.route('/profile/:_id',
	{	name: 'Profile',
		controller: 'ProfileController'
	}
);
	// VERIFICATION LINK
	Router.route('/profile/verify/:_userId', {
		name: 'Registration_Verification',
		controller: 'VerifyAccountController'
	});
	// RESET PASSWORD LINK
	Router.route('/profile/reset-password/:_userId', {
		name: 'Profile_Resetpassword',
		controller: 'ResetPasswordController'
	});
	// EDIT - JOB SEEKER
	Router.route('/profile/job-seeker/:_id/edit',
		{	name: 'Profile_JS_Edit',
			controller: 'EditProfileController'
		}
	);
	// EDIT - EMPLOYER
	Router.route('/profile/employer/:_id/edit',
		{	name: 'Profile_Emp_Edit',
			controller: 'EditProfileController'
		}
	);
	// EDIT - ADMIN
	Router.route('/profile/admin/:_id/edit', {
		name: 'Profile_Admin_Edit',
		controller: 'ProfileController',
		onBeforeAction: function() {
			// has to be themselves OR the root admin
			if (!Roles.userIsInRole(Meteor.userId(), 'root')) {
				if (Meteor.userId() != this.params._id) { 
					Router.go('Home');
					Notify("Invalid permissions to edit profile!", "fail");
				}
			}
			this.next();
		}
	});
// ADMIN
	// Home/Dashboard
	Router.route('/admin', {
		name: 'Admin_Home',
		template: 'Admin_Home',
		controller: 'AdministrationController'
	});
	// Users
	Router.route('/admin/users', {
		name: 'Admin_Users',
		template: 'Admin_Users',
		controller: 'AdministrationController'
	});
	// Reports
	Router.route('/admin/reports', {
		name: 'Admin_Reports',
		template: 'Admin_Reports',
		controller: 'AdministrationController'
	});
// Reset password controller
ResetPasswordController = RouteController.extend({
	onBeforeAction: function() {
		// Get the token passed in
		var token = this.params.query.token;
		var userId = this.params._userId;

		Meteor.call("UTIL_CheckResetPasswordToken", userId, token, function(err) {
			if (err) { Notify("Error reseting password: " + err.error, "fail"); Router.go('Home'); }
		});
		this.next();
	},
	layoutTemplate: 'Profile_Resetpassword'
});
// Verify account controller
VerifyAccountController = RouteController.extend({
	onBeforeAction: function() {
		// Verify the passed in token
		var token = this.params.query.token;
		var userId = this.params._userId;
		
		Meteor.call("UTIL_VerifyAccount", userId, token, function(err) {
			if (err) {
				Router.go('Home');
				Notify('Error in verifying your account: ' + err.error, "fail");
			}
		});
		this.next();
	},
	waitOn: function() { return Meteor.subscribe('profile', this.params._userId); },
	data: function() { return Meteor.users.findOne({'_id':this.params._userId}); },
	layoutTemplate: 'Registration_Verification'
});
// Authorization controller
AdministrationController = RouteController.extend({
	layoutTemplate: 'Admin_Index',
	waitOn: function() {
		return Meteor.subscribe('roles');
	},
	onBeforeAction: function() {
		var userId = Meteor.userId();
		if (_.isNull(userId) ||
			_.isUndefined(userId)) {
			// User is not logged in, direct to Admin Login
			Router.go('Login', {_portal:'admin'});
		} else if (!Roles.userIsInRole(userId, 'admin')) {
			 Router.go('Home');
		} else { this.next(); }
	}
});
// JobSeeker authorization and data controller
ProfileController = RouteController.extend({
	onBeforeAction: function() {
		if (!Meteor.userId()) { Router.go('Home'); }
		var userId = this.params._id;
		// increment page views
		Meteor.call("UTIL_IncrementViews", userId);
		this.next();
	},
	data: function() {
		return Meteor.users.findOne({'_id':this.params._id});
	},
	waitOn: function() {
		return [
			Meteor.subscribe('roles'),
			Meteor.subscribe('profile', this.params._id, Meteor.userId())
		];
	}
});
// JobSeeker profile authorization
EditProfileController = ProfileController.extend({
	onBeforeAction: function() {
		var userId = Meteor.userId();
		if (!Roles.userIsInRole(userId, 'admin')) {
			if (this.params._id != userId) {
				// User is not logged in, direct to Admin Login
				this.render('one-oh-one');
			} else { this.next(); }
		} else { this.next(); }
	}
});

// Configuration for name converter
Router.setTemplateNameConverter(function (str) { return str; });