Meteor.methods({
	// Takes in an admin object, creates a new account and sends an email to the user
	// with the necessary login details
	UTIL_CreateNewAdmin: function(userId, admin, email) {
		// Authorization
		userId = Meteor.userId();
		Meteor.call("AUTH_IsAdmin", userId);
		// Generate random password
		var password = GenerateRandomString(4);
		var id = Accounts.createUser({
			email: email,
			password: password,
			profile: admin
		});
		// Set added by
		Meteor.users.update({'_id':id}, {$set: {
				'profile.addedBy': userId
			}
		});
		// Set role to admin
		Roles.addUsersToRoles(id, "admin");
		// Send email with account details
		Meteor.call("EMAIL_AdminAccountCreationVerification", id, email, password);
	},
	// Change profile details for a job seeker
	UTIL_EditAdminSpecificDetailsJS: function(targetUserId, edit_object) {
		// Authorization
		var userId = Meteor.userId();
		Meteor.call("AUTH_IsAdmin", userId);
		if (edit_object.status == "placed") {
			// Update deplyoment details
			Meteor.users.update({'_id':targetUserId}, {$set: {
					'profile.progress.deployment.start':edit_object.deployment.start,
					'profile.progress.deployment.end':edit_object.deployment.end,
					'profile.progress.deployment.place':edit_object.deployment.place
				}
			});
		}
		Meteor.users.update({'_id':targetUserId}, {$set: {
				'profile.status':edit_object.status,
				'profile.progress.comment':edit_object.comment,
				'profile.progress.assigned': {'_id': userId }
			}
		});
	},
	// Change profile details for an employer
	UTIL_EditAdminSpecificDetailsEMP: function(targetUserId, edit_object) {
		// Authorization
		var userId = Meteor.userId();
		Meteor.call("AUTH_IsAdmin", userId);
		Meteor.users.update({'_id':targetUserId}, {$set: {
				'profile.status':edit_object.status
			}
		});
	},
	// Used to log user search queries
	UTIL_LogQuery: function(query, type) {
		// Check to see if the user is logged in
		if (!Meteor.userId()) { return; }
		query.user = {}; query.user._id = Meteor.userId();
		var td = new Date();
		var tdUTC = new Date(Date.UTC(td.getFullYear(), td.getMonth() + 1, td.getDate(), 0,0,0));
		Queries.update({'x':tdUTC, 'type': type}, {
			$inc: {
				'y': 1
			},
			$push: {
				'queries':query
			},
			$set: {
				'type': type
			}
		}, { upsert: true });
	},
	// Used to edit administration profile
	UTIL_EditAdminProfile: function(targetUserId, profile) {
		// Authorization
		var userId = Meteor.userId();
		Meteor.call("AUTH_IsSelfOrRootAdmin", userId, targetUserId);
		// Edit profile
		Meteor.users.update({'_id':targetUserId}, {$set: {
				'profile.personal_details': profile.personal_details
			}
		});
	},
	// Gets the admin profile
	UTIL_GetAdmin: function(userId) {
		var profile = Meteor.users.findOne({'_id':userId}).profile;
		return profile;
	},
	// Remove admin
	UTIL_RemoveAdmin: function(targetUserId)  {
		// auth
		var userId = Meteor.userId();
		Meteor.call("AUTH_IsRoot", userId);
		Meteor.users.remove(targetUserId);
	},
	// Changes admin priveledges
	UTIL_ToggleRevokeAdmin: function(targetUserId) {
		// auth
		var userId = Meteor.userId();
		Meteor.call("AUTH_IsRoot", userId);
		if (Roles.userIsInRole(targetUserId, 'revoked-admin')) {
			Roles.setUserRoles(targetUserId, 'admin');
		} else if (Roles.userIsInRole(targetUserId, 'admin')) {
			Roles.setUserRoles(targetUserId, 'revoked-admin');
		}
	},
	// Used to create a new vacancy
	UTIL_CreateNewVacancy: function(vacancy) {
		// auth
		var userId = Meteor.userId();
		Meteor.call("AUTH_IsAdmin", userId);
		// Add to vacancies collection
		var id = Vacancies.insert({
			vacancy: vacancy,
			published: false,
			createdAt: new Date(),
			author: {
				_id: userId
			}
		});
		return id;
	},
	// Used to save changes made to a vacancy post
	UTIL_SaveVacancy: function(vacancyId, vacancy) {
		// auth
		var userId = Meteor.userId();
		Meteor.call("AUTH_IsAdmin", userId);
		// make changes
		Vacancies.update({'_id': vacancyId}, {$set: {
				vacancy: vacancy
			}
		});
	},
	// Used to toggle vacancy publish status
	UTIL_ToggleVacancyPublish: function(vacancyId) {
		// auth
		var userId = Meteor.userId();
		Meteor.call("AUTH_IsAdmin", userId);
		// toggle publish status
		var status = Vacancies.findOne({'_id':vacancyId}).published;
		status = !status;
		Vacancies.update({'_id': vacancyId}, {$set: {
				published: status
			}
		});
	},
	// Used to remove a vacancy position
	UTIL_RemoveVacancy: function(vacancyId) {
		// auth
		var userId = Meteor.userId();
		Meteor.call("AUTH_IsAdmin", userId);
		// remove
		Vacancies.remove({'_id':vacancyId});
	},
	// Used to generate a token to view a job seekers profile
	UTIL_GenerateJobSeekerToken: function(jobSeekerId) {
		var userId = Meteor.userId();
		// Auth
		Meteor.call("AUTH_IsAdmin", userId);
		// Genereate token string
		var token = GenerateRandomId(16);
		// Add token to jobseeker profile
		Meteor.users.update({'_id':jobSeekerId}, {$push: {
				'profile.request_tokens': {
					'date': new Date(),
					'token': token
				}
			}
		});
		// Return url
		var current_path = Meteor.absoluteUrl();
		return current_path + "profile/" + jobSeekerId + "?token=" + token;
	},
	// Used to delete/remove atoken from a job seekers' profile
	UTIL_RemoveJobSeekerToken: function(jobSeekerId, token) {
		var userId = Meteor.userId();
		// Auth
		Meteor.call("AUTH_IsAdmin", userId);
		Meteor.call("UTIL_DeleteJobSeekerToken", jobSeekerId, token);
	},
	UTIL_DeleteJobSeekerToken: function(jobSeekerId, token) {
		// Remove token from profile
		Meteor.users.update({'_id':jobSeekerId}, {$pull: {
				'profile.request_tokens': { 'token': token }
			}
		});
	}
});