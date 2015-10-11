Template.Register_JS.created = function() {
	Session.set('cv-error', false);
	Session.set('password-error', false);
	Session.set('processing', false);
	Session.set('tnc-error', false);
};
Template.Register_JS.helpers({
	// used for combobox's
	provinces: function() { return PROVINCES(); },
	positions: function() { return JOBS(); },
	industries: function() { return INDUSTRIES},
	sapModules: function() { return SAP_MODULES; },
	cvError: function() { return Session.get('cv-error'); },
	passwordError: function() { return Session.get('password-error'); },
	errors: function() { return Session.get('xfxinput-error'); },
	processing: function() { return Session.get('processing'); },
	tncError:function() { return Session.get('tnc-error'); }
});
Template.Register_JS.events({
	"submit": function(e, t) {
		e.preventDefault();
		// verify input
			var ie = false;
			if (!Input_check_errors('xfx')) { ie = true; }
			// Check to see that a CV has been attached
			/*if (_.isUndefined(t.find('.js-cv-input').files[0])) {
				Session.set('xfxinput-error', true);
				Session.set('cv-error', 'A CV is required to complete the registration process.');
				ie = true;
			}*/
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
		// Check terms and conditions is ticked
		if (!t.find(".js-tnc").checked) { Session.set('tnc-error', 'You must agree to the Terms and Conditions in order to register. Tick the checkbox in order to continue.'); ie = true; }
		else { Session.set('tnc-error', false); }
		if (ie) { return; }
		// PERSONAL DETAILS
		job_seeker.personal_details.name = null;//Session.get('reg-name');
		job_seeker.personal_details.surname = null;//Session.get('reg-surname');
		job_seeker.personal_details.tel_number = null;//Session.get('reg-tel');
		job_seeker.personal_details.cell_number = null;//Session.get('reg-cell');
		job_seeker.personal_details.province = null;//Session.get('reg-province');
		job_seeker.personal_details.suburb = null;//Session.get('reg-suburb');
		// SALARY DETAILS
		job_seeker.salary_details.current = null;//parseInt(Session.get('reg-current-salary'));
		job_seeker.salary_details.moveFor = null;//parseInt(Session.get('reg-move-for-salary'));
		job_seeker.salary_details.ideal = null;//parseInt(Session.get('reg-ideal-salary'));
		// ROLE REQUIREMENTS
		job_seeker.role_requirements.current_job = null;//Session.get('reg-current-job');
		job_seeker.role_requirements.desired_job = null;//Session.get('reg-desired-job');
		job_seeker.role_requirements.sap_module = null;//Session.get('reg-sap-module');
		job_seeker.role_requirements.industry = null;//Session.get('reg-industry');
		job_seeker.role_requirements.skills = [];
		// Create Job Seeker
		var portal = this.key;
		//var file = t.find('.js-cv-input').files[0];
		//var cv = new FS.File(file); var containsCV = false;
		//if (file) { containsCV = true; }
		// Set 'processing' to true
		Session.set('processing', true);
		Meteor.call("UTIL_CreateNewJobSeeker", job_seeker, email, password_1, function(err, jobSeekerId) {
			if (err) {
				Notify("Job seeker register error: " + err.error, "fail");
			} /*else if (jobSeekerId && containsCV) {
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
			}*/ else if (jobSeekerId) {
				Router.go('Login', {_portal: portal}, {query: 'registrationSuccess=true'});
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