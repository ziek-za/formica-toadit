Meteor.methods({
	// Takes in a job_seeker object, creates a new account and returns the _id
	// of the account
	UTIL_CreateNewJobSeeker: function(job_seeker, email, password) {
		var id = Accounts.createUser({
            email: email,
            password: password,
            profile: job_seeker
        });
		// Set email to be un-verified
		// Set user profile status: pending/active/inactive
		Meteor.users.update({'_id':id, 'emails.address':email}, {$set: {
				'emails.$.verified': false,
				'profile.status': 'pending'
			}
		});
        // Set role (job-seeker/admin/employer)
        Roles.addUsersToRoles(id, "job-seeker");
        // Send verification email
        Meteor.call("EMAIL_AccountCreationVerification", id, 'Job Seeker');

    	return id;
	},
	// Upload method for CollectionFS to upload a CV to user profile
	UTIL_AddCVUpload: function(userId, targetUserId, cv_id, cv_name) {
		// authorize if it isSelf / isAdmin
		Meteor.call("AUTH_IsSelfOrAdmin", userId, targetUserId);
		// Ammend file upload to user
		var cv_path = "/cfs/files/cv/" + cv_id;
		Meteor.users.update({'_id':targetUserId}, {$push: {
				'profile.cv': {
					'_id': cv_id,
					'path': cv_path,
					'name': cv_name,
					'uploaded': new Date()
				}
			}
		});
	},
	// Removes a CV from the user's profile and from
	// the collection. Called from server.
	UTIL_RemoveCV: function(userId, cvId) {
		// Remove CV from users profile
		Meteor.users.update({'_id':userId}, {$pull: {
				'profile.cv': {
					'_id': cvId
				}
			}
		});
	},
	// Used to edit a jobsekers profile, as an admin or as
	// as the profile owner
	UTIL_EditJobSeekerProfile: function(userId, targetUserId, jobSeekerObj) {
		// authorize if it isSelf / isAdmin
		Meteor.call("AUTH_IsSelfOrAdmin", userId, targetUserId);
		// parse salary details to integer values
		jobSeekerObj.salary_details.current = parseInt(jobSeekerObj.salary_details.current);
		jobSeekerObj.salary_details.moveFor = parseInt(jobSeekerObj.salary_details.moveFor);
		jobSeekerObj.salary_details.ideal = parseInt(jobSeekerObj.salary_details.ideal);

		Meteor.users.update({'_id':targetUserId}, {$set: {
				'profile.personal_details': jobSeekerObj.personal_details,
				'profile.role_requirements': jobSeekerObj.role_requirements,
				'profile.salary_details': jobSeekerObj.salary_details
			}
		});
	},
	UTIL_ChangeEmail: function(targetUserId, userId, email, curr_email) {
		// Authorize if isSelf
		Meteor.call("AUTH_IsSelf", userId, targetUserId);
		// Check to see if valid
		if (!validateEmail(email)) { throw new Meteor.Error("Invalid email address entered"); }
		// Check to see the email doesn't exist.
		var user = Meteor.users.findOne({'emails.address':email});
		if (_.isUndefined(user)) {
			// Change email address
			Meteor.users.update({'_id':targetUserId, 'emails.address':curr_email}, {$set: {
					'emails.$.address': email
				}
			});
		} else { throw new Meteor.Error("<strong>"+email+"</strong> all ready exists, unable to assign as new email")}
	},
	// Increments page views for user profile
	UTIL_IncrementViews: function(userId) {
		var td = new Date();
		var tdUTC = new Date(Date.UTC(td.getFullYear(), td.getMonth() + 1, td.getDate(), 0,0,0));
		var user = Meteor.users.findOne({'_id':userId});
		if (!user) { return; }
		var pva = user.profile.pageviews;
		var contains = false;
		if (pva) {
			if (pva[pva.length - 1].x.toString() == tdUTC.toString()) {
				contains = true;
			}
		}
		if (contains) {
			Meteor.users.update({'_id': userId, 'profile.pageviews.x': tdUTC}, {
				$inc: {
					'profile.pageviews.$.y': 1,
					'profile.total_pageviews': 1
				}
			});
		} else {
			Meteor.users.update({'_id': userId}, {
				$push: {
					'profile.pageviews':  {
						'x':tdUTC,
						'y':1
					}
				},
				$inc: {
					'profile.total_pageviews':1
				}
			});
		}
	}
});