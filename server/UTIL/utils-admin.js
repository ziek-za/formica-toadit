Meteor.methods({
	// Takes in an admin object, creates a new account and sends an email to the user
	// with the necessary login details
	UTIL_CreateNewAdmin: function(userId, admin, email) {
		// Authorization
		Meteor.call("AUTH_IsAdmin", userId);
		// Generate random password
		var password = GenerateRandomString(4);
		// For development purposes
		console.log("Password: " + password);
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
	UTIL_EditAdminSpecificDetailsJS: function(userId, targetUserId, comment, status) {
		// Authorization
		Meteor.call("AUTH_IsAdmin", userId);
		Meteor.users.update({'_id':targetUserId}, {$set: {
				'profile.status':status,
				'profile.progress.comment':comment,
				'profile.progress.assigned': {'_id': userId }
			}
		});
	},
	// Used to log user search queries
	UTIL_LogQuery: function(query, type) {
		// Check to see if the user is logged in
		if (!Meteor.userId()) { return; }
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
	}
});