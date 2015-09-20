Template.Profile.helpers({
	// Check to see whether the profile is a Job seeker
	// profile or not
	isJobSeeker: function() {
		if (_.contains(this.roles, 'job-seeker')) {
			return true;
		}
		return false;
	}
});
	// Profile > Profile_Edit_* > Profile_Edit_Login
	Template.Profile_Edit_Login.created = function() {
		// Reset errors for changing email address
		Session.set('email-change-fail', false);
		Session.set('email-change-success', false);
		Session.set('email-change-error', false);
		// Reset pw-change status
		Session.set('pw-change-error', false);
		Session.set('pw-change-success', false);
		Session.set('pw-change-fail', false);
	};
	Template.Profile_Edit_Login.helpers({
		isOwnProfile: function() { return this._id == Meteor.userId(); },
		primaryEmail: function() { return this.emails[0].address; },
 		// password change error
 		pwChangeError: function() { return Session.get('pw-change-error'); },
 		pwChangeSuccess: function() { return Session.get('pw-change-success'); },
 		pwChangeFail: function() { return Session.get('pw-change-fail'); },
 		// email change response
 		emailChangeSuccess: function() { return Session.get('email-change-success'); },
 		emailChangeFail: function() { return Session.get('email-change-fail'); },
 		emailChangeError: function() { return Session.get('email-change-error'); }
	});
	Template.Profile_Edit_Login.events({
		// Used to save out password.
 		"click .js-save-password": function(e, t) {
 			// Reset pw-change status
 			Session.set('pw-change-error', false);
 			Session.set('pw-change-success', false);
 			Session.set('pw-change-fail', false);
 			// verify input
 			if (!Input_check_errors('xyz')) { return; }
 			Session.set('pw-change-error', false);
 			// Get session variables allocated to password
			var old_pw = Session.get('old-password');
			var new_pw = Session.get('new-password'); 			
			var new_pw_2 = Session.get('new-password-2');
			// Checks
			if (_.isUndefined(new_pw) ||
				new_pw == "" ||
				_.isUndefined(new_pw_2) ||
				new_pw_2 == "") { Session.set('pw-change-error', '<strong>New Password(s)</strong> are required'); return; }
			if (new_pw != new_pw_2) { Session.set('pw-change-error', '<strong>New Passwords(s)</strong> do NOT match'); return; }
			// Call method to change password
			Accounts.changePassword(old_pw, new_pw, function(err) {
				if (err) {
					Session.set('pw-change-error', 'There was an error changing your password, try again later. (' + err.error + ')');
				} else {
					Session.set('pw-change-success', 'Successfully changed your password. This is effective immediately')
				}
			});
 		},
 		// Used to save out email.
 		"click .js-save-email": function(e, t) {
 			// Reset errors
 			Session.set('email-change-fail', false);
 			Session.set('email-change-success', false);
 			Session.set('email-change-error', false);
 			// verify input
 			if (!Input_check_errors('gbd')) { return; }
 			// get session variables
 			var email = Session.get('email-address');
 			var curr_email = this.emails[0].address;
 			if (email == curr_email) { Session.set('email-change-error', '<strong>' + email + '</strong> is your current email address'); return; }
 			var userId = Meteor.userId(); var targetUserId = this._id;
 			Meteor.call("UTIL_ChangeEmail", targetUserId, userId, email, curr_email, function(err) {
 				if (err) {
 					Session.set('email-change-fail', err.error);
 				} else {
 					Session.set('email-change-success', "Successfully saved your new email as (<strong>" + email +"</strong>)");
 				}
 			});
 		},
	});

	// Profile > Profile_Emp
	Template.Profile_Emp.helpers({
		canEdit: function() {
			var targetUserId = this._id;
			var userId = Meteor.userId();
			// Check to see if it is their profile
			if (targetUserId != userId) {
				// Check to see if they are an admin
				if (!Roles.userIsInRole(userId, 'admin')) {
					return false;
				}
			}
			return true;
		}
	});
 	Template.Profile_Emp.events({});
	// Profile > Profile_JS
	Template.Profile_JS.helpers({
		canEdit: function() {
			var targetUserId = this._id;
			var userId = Meteor.userId();
			// Check to see if it is their profile
			if (targetUserId != userId) {
				// Check to see if they are an admin
				if (!Roles.userIsInRole(userId, 'admin')) {
					return false;
				}
			}
			return true;
		},
		screeningAdmin: function() {
			Meteor.call("UTIL_GetAdmin", this.profile.progress.assigned._id, function(err, admin) {
				if (!err) { Session.set('screening-admin', admin); }
			});
			return Session.get('screening-admin');
		}
	});
 	Template.Profile_JS.events({});
 	// Profile > Profile_Emp > Profile_Emp_Edit
 	Template.Profile_Emp_Edit.created = function() {
 		Session.set('change-image-input', false);
 	};
 	Template.Profile_Emp_Edit.helpers({
 		// arrays used for input fields
 		provinces: function() { return PROVINCES(); },
 		pageContainsError: function() { return Session.get('cbainput-error'); }
 	});
 	Template.Profile_Emp_Edit.events({
 		// Global cancel
		"click .js-cancel": function(e ,t) {
			Router.go('Profile', {'_id':this._id});
			Notify("Changes to <strong>" + this.profile.company_details.name + "</strong> were cancelled.", "warning");
		},
 		// Used to save out profile information/details
 		"click .js-save": function(e, t) {
 			// verify input
 			if (!Input_check_errors('cba')) { return; }
 			// Continue if true
 			var userId = Meteor.userId();
 			var targetUserId = this._id;
 			if (Session.get('change-image-input')) {
 				// Image has been set to upload
 				var profile_picture = t.find('.js-image-input').files;
 				console.log(profile_picture);
 			}
 			var employer = {
 				contact_person_details: {}, 
 				company_details: {}
			};
 			// Change of company_details
 			employer.company_details = {
 				'name': Session.get('name'),
 				'tel_number': Session.get('tel-number'),
 				'province': Session.get('province')
 			};
 			// Change of representative details
 			employer.contact_person_details = {
 				'name': Session.get('rep-name'),
 				'surname': Session.get('rep-surname'),
 				'contact': Session.get('rep-contact')
 			};

 			Meteor.call("UTIL_EditEmployerProfile", userId, targetUserId, employer, function(err) {
 				if (!err) {
 					Router.go("Profile", {'_id': targetUserId});
 					Notify("Successfully saved changes to your profile", "success");
 				} else {
 					Notify("Unable to save changes: " + err.error, "fail");
 				}
 			});
 		},
 		// Used to signal that the profile picture has been changed
 		"change .js-image-input": function() {
 			Session.set('change-image-input', true);
 		},
 		// Used to signal that the CV has been changed
 		"change .js-cv-input": function(e, t) {
 			Session.set('change-cv-input', true);
 			var file = t.find('.js-cv-input').files[0];
 			if (!_.isUndefined(t.find('.js-cv-input').files[0]) &&
 				file.type == "application/pdf") {
 				Session.set('cv-error', false);
 				Session.set('abcinput-error', false);
 			} else {
 				Session.set('cv-error', "Invalid file format for CV upload");
 			}
 		},
 		// Used to remove CV
 		"click .js-remove-cv": function(e, t) {
 			var cv_id = this._id;
 			var toBeRemoved = Session.get('remove-cv');
 			if (toBeRemoved) { toBeRemoved = false; Session.set('cv-error', false); Session.set('abcinput-error', false); }
 			else { toBeRemoved = {'_id':cv_id}; Session.set('cv-error', "If you are trying to replace your CV, you are <strong>required to upload a new one as well</strong>."); }
 			Session.set('remove-cv', toBeRemoved);
 		}
 	});
 	// Profile > Profile_JS > Profile_JS_Edit
 	Template.Profile_JS_Edit.created = function() {
 		Session.set('change-image-input', false);
 		Session.set('change-cv-input', false);
 		Session.set('remove-cv', false);
 		Session.set('cv-error', false);
 	};
 	Template.Profile_JS_Edit.helpers({
 		// admin controls
 		isBeingPlaced: function() { return (Session.get('account-state') == "placed"); },
 		toBeRemoved: function() {
 			return Session.get('remove-cv');
 		},
 		// arrays used for input fields
 		provinces: function() { return PROVINCES(); },
 		jobs: function() { return JOBS(); },
 		accountStates: function() { return CONST_JOBSEEKER_STATES; },
 		pageContainsError: function() { return Session.get('abcinput-error'); },
 		cvError: function() { return Session.get('cv-error'); },
 		showCVUpload: function() {
 			if (!this.profile.cv || Session.get('remove-cv')) {
 				return true;
 			}
 			return false;
 		}
 	});
 	Template.Profile_JS_Edit.events({
 		// Global cancel
		"click .js-cancel": function(e ,t) {
			Router.go('Profile', {'_id':this._id});
			Notify("Changes to <strong>" + this.profile.personal_details.name + " " + this.profile.personal_details.surname +"</strong> were cancelled.", "warning");
		},
 		// Used to save out changes to 'admin specific' progress
 		"click .js-save-admin": function(e, t) {
 			// Verify input
 			if (!Input_check_errors('bvf')) { return; }
 			var admin_edit_details = {
 				'comment': Session.get('progress-comment'),
 				'status': Session.get('account-state'),
 				'deployment': {
 					'start': Session.get('deploy-start'),
 					'end': Session.get('deploy-end'),
 					'place': Session.get('deploy-place')
 				}
 			};
 			var targetUserId = this._id;
 			// Update admin specific details
 			Meteor.call("UTIL_EditAdminSpecificDetailsJS", targetUserId, admin_edit_details, function(err) {
 				if (err) {
 					Notify("Error with saving Job Seeker admin specific details: " + err.error, "fail");
 				} else {
					Notify("Successfully saved Job Seeker admin specific details!", "success");
 				}
 			});
 		},
 		// Used to save out profile information/details
 		"click .js-save": function(e, t) {
 			// verify input
 			if (!Input_check_errors('abc')) { return; }
 			// check to see not removing a CV w/o uploading a new one
 			if (Session.get('remove-cv')) {
 				if (_.isUndefined(t.find('.js-cv-input').files[0])) {
 					Session.set('abcinput-error', true);
 					return;
 				}
 			}
 			// Continue if true
 			var userId = Meteor.userId();
 			var targetUserId = this._id;
 			if (Session.get('change-image-input')) {
 				// Image has been set to upload
 				var profile_picture = t.find('.js-image-input').files;
 				console.log(profile_picture);
 			}
 			// Change of job
 			var role_requirements = {
 				'current_job': Session.get('current-job'),
 				'desired_job': Session.get('desired-job')
 			};
 			// Change of salary details
 			var salary_details = {
 				'current': Session.get('current-salary'),
 				'moveFor': Session.get('move-for-salary'),
 				'ideal': Session.get('ideal-salary')
 			};
 			// Change of personal_details
 			var personal_details = {
 				'name': Session.get('first-name'),
 				'surname': Session.get('surname'),
 				'tel_number': Session.get('tel-number'),
 				'cell_number': Session.get('cell-number'),
 				'suburb': Session.get('suburb'),
 				'province': Session.get('province')
 			};
 			// Uploading of a CV
 			if (Session.get('change-cv-input')) {
 				// Image has been set to upload
 				var cv = new FS.File(t.find('.js-cv-input').files[0]);
 				cv.metadata = {
 					'uploadUserId': userId,
 					'targetUserId': targetUserId
 				}
 				CV.insert(cv, function(err, obj) {
 					if (!err) {
 						Meteor.call("UTIL_AddCVUpload", userId, targetUserId, obj._id, obj.data.blob.name);
// 						Sesson.set('change-cv-input', false);
 					}
 				});
 			}
 			// Removing a CV
 			if (Session.get('remove-cv')) {
 				var cvId = Session.get('remove-cv')._id;
 				CV.remove(cvId);
 				Session.set('remove-cv', false);
 			}

 			// Update user profile details
 			var jobSeeker = {
 				'personal_details':personal_details,
 				'salary_details': salary_details,
 				'role_requirements': role_requirements
 			};

 			Meteor.call("UTIL_EditJobSeekerProfile", userId, targetUserId, jobSeeker, function(err) {
 				if (!err) {
 					Router.go("Profile", {'_id': targetUserId});
 					Notify("Successfully saved changes to your profile", "success");
 				} else {
 					Notify("Unable to save changes: " + err.error, "fail");
 				}
 			});
 		},
 		// Used to signal that the profile picture has been changed
 		"change .js-image-input": function() {
 			Session.set('change-image-input', true);
 		},
 		// Used to signal that the CV has been changed
 		"change .js-cv-input": function(e, t) {
 			Session.set('change-cv-input', true);
 			var file = t.find('.js-cv-input').files[0];
 			if (!_.isUndefined(t.find('.js-cv-input').files[0]) &&
 				file.type == "application/pdf") {
 				Session.set('cv-error', false);
 				Session.set('abcinput-error', false);
 			} else {
 				Session.set('cv-error', "Invalid file format for CV upload");
 			}
 		},
 		// Used to remove CV
 		"click .js-remove-cv": function(e, t) {
 			var cv_id = this._id;
 			var toBeRemoved = Session.get('remove-cv');
 			if (toBeRemoved) { toBeRemoved = false; Session.set('cv-error', false); Session.set('abcinput-error', false); }
 			else { toBeRemoved = {'_id':cv_id}; Session.set('cv-error', "If you are trying to replace your CV, you are <strong>required to upload a new one as well</strong>."); }
 			Session.set('remove-cv', toBeRemoved);
 		}
 	});

function createChart(data) {
	    $('#container-area').highcharts({
	        chart: { type: 'area' },
	       	title: { text: 'Pageviews (Total: ' + data.views + ')' },
	        credits: { enabled: false },
	        //subtitle: { text: 'Source: <a href="http://thebulletin.metapress.com/content/c4120650912x74k7/fulltext.pdf">' +'thebulletin.metapress.com</a>' },
	        xAxis: {
	            type: "datetime",
	        },
	        yAxis: {
	            title: { text: null }
	        },
	       	tooltip: {
	       		headerFormat: "",
	       		pointFormatter: function() { return "<span style='font-size:20px;'>"+Highcharts.dateFormat('%d %b %Y', this.x, true)+"<span><br/><strong>Pageviews:</strong> "+this.y; }
	       	},
	        legend: { enabled: false },
	        plotOptions: {
	            area: {
	                marker: {
	                    enabled: false,
	                    symbol: 'circle',
	                    radius: 2
	                }
	            }
	        },
	        
	        series: [{
	        	type: 'area',
	            data: data.data
	        }]
	    });
	}

	// Profile_JS_Views
	Template.Profile_JS_Views.rendered = function() {
		var data = {
			views: this.data.profile.total_pageviews,
			data: this.data.profile.pageviews
		};
	    createChart(data);
	}

	// Profile > Profile_Admin_Edit
	Template.Profile_Admin_Edit.helpers({

	});
	Template.Profile_Admin_Edit.events({
		// Used to save out changes to administration profile
		"click .js-save": function(e, t) {
			// verify input
			if(!Input_check_errors('vbn')) { return; }
			// get details
			var profile = { personal_details: {}};
			profile.personal_details.name = Session.get('admin-name');
			profile.personal_details.surname = Session.get('admin-surname');
			// Call to change admin profile
			var targetUserId = this._id;
			Meteor.call("UTIL_EditAdminProfile", targetUserId, profile, function(err) {
				if (err) { Notify("There was an error saving changes to your profile: " + err.error, "fail"); }
				else { Router.go("Home"); Notify("Successfully saved changes to your profile", "success"); }
			});
		},
		"click .js-cancel": function(e, t) {
			Router.go("Home");
			Notify("Changes to your profile were cancelled.", "warning");
		},
		// Used to remove a admin
		"click .js-remove": function() {
			var targetUserId = this._id;
			Meteor.call("UTIL_RemoveAdmin", targetUserId, function(err) {
				if (err) { Notify("There was an error with removing an admin: " + err.error, "fail"); }
				else {
					Notify("Successfully removed admin!", "success");
					Router.go("Home");
				}
			});
		},
		// Used to revoke rights
		"click .js-revoke": function() {
			var targetUserId = this._id;
			Meteor.call("UTIL_ToggleRevokeAdmin", targetUserId, function(err) {
				if (err) { Notify("There was an error with changing admin priviledges: " + err.error, "fail"); }
				else {
					Notify("Successfully changed admin priviledges!", "success");
				}
			});
		}
	});
