Template.Register_JS.created = function() {
	Session.set('cv-error', false);
	Session.set('password-error', false);
	Session.set('processing', false);
};
Template.Register_JS.helpers({
	provinces: function() { return PROVINCES(); },
	positions: function() { return JOBS(); },
	cvError: function() { return Session.get('cv-error'); },
	passwordError: function() { return Session.get('password-error'); },
	errors: function() { return Session.get('xfxinput-error'); },
	processing: function() { return Session.get('processing'); }
});
Template.Register_JS.events({
	"submit": function(e, t) {
		e.preventDefault();
		// verify input
			var ie = false;
			if (!Input_check_errors('xfx')) { ie = true; }
			// Check to see that a CV has been attached
			if (_.isUndefined(t.find('.js-cv-input').files[0])) {
				Session.set('xfxinput-error', true);
				Session.set('cv-error', 'A CV is required to complete the registration process.');
				ie = true;
			}
		// --------
		var job_seeker = {
			'personal_details': {},
			'salary_details': {},
			'role_requirements': {},
			'misc': {},
			'picture': {
				'regular': '/style/images/default_jobseeker_profile.jpg',
				'thumbnail': '/style/images/default_jobseeker_profile.jpg'
			}
		};
		// ACCOUNT DETAILS
		var email = Session.get('reg-email');
		var password_1 = Session.get('reg-password-1');
		var password_2 = Session.get('reg-password-2');
		// verify password input
			if (password_1 != password_2) { Session.set('password-error', 'The provided passwords do not match.'); ie = true; }
		// --------
		if (ie) { return; }
		// PERSONAL DETAILS
		job_seeker.personal_details.name = Session.get('reg-name');
		job_seeker.personal_details.surname = Session.get('reg-surname');
		job_seeker.personal_details.tel_number = Session.get('reg-tel');
		job_seeker.personal_details.cell_number = Session.get('reg-cell');
		job_seeker.personal_details.province = Session.get('reg-province');
		job_seeker.personal_details.suburb = Session.get('reg-suburb');
		// SALARY DETAILS
		job_seeker.salary_details.current = parseInt(Session.get('reg-current-salary'));
		job_seeker.salary_details.moveFor = parseInt(Session.get('reg-move-for-salary'));
		job_seeker.salary_details.ideal = parseInt(Session.get('reg-ideal-salary'));
		// ROLE REQUIREMENTS
		job_seeker.role_requirements.current_job = Session.get('reg-current-job');
		job_seeker.role_requirements.desired_job = Session.get('reg-desired-job');
		// Create Job Seeker
		var portal = this.key;
		var cv = new FS.File(t.find('.js-cv-input').files[0]);
		// Set 'processing' to true
		Session.set('processing', true);
		Meteor.call("UTIL_CreateNewJobSeeker", job_seeker, email, password_1, function(err, jobSeekerId) {
			if (err) {
				console.log("Job seeker register error: " + err.error);
			} else if (jobSeekerId) {
				cv.metadata = {
					'uploadUserId': jobSeekerId,
					'targetUserId': jobSeekerId
				}
				CV.insert(cv, function(err, obj) {
					if (!err) {
						Meteor.call("UTIL_AddCVUpload", jobSeekerId, jobSeekerId, obj._id, obj.data.blob.name, function(err) {
							if (!err) { Router.go('Login', {_portal: portal}, {query: 'registrationSuccess=true'}); }
						});
					}
				});
			}
		});
		return false;
	},
	// Used to signal that the CV has been changed
	"change .js-cv-input": function(e, t) {
		var file = t.find('.js-cv-input').files[0];
		if (!_.isUndefined(t.find('.js-cv-input').files[0]) &&
			file.type == "application/pdf") {
			Session.set('cv-error', false);
			Session.set('xfxinput-error', false);
		} else {
			Session.set('cv-error', "Invalid file format for CV upload");
		}
	},
	// Used to cancel changes
	"click .js-cancel": function(e, t) {
		Router.go("Login", {_portal:'job-seeker'});
	}
});