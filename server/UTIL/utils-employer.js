Meteor.methods({
	// Takes in an employer object, containing employer specific details
	// and creates an account and sends verification email
	UTIL_CreateNewEmployer: function(employer, email, password) {
		var id = Accounts.createUser({
            email: email,
            password: password,
            profile: employer
        });
		// Set email to be un-verified
		Meteor.users.update({'_id':id, 'emails.address':email}, {$set: {
				'emails.$.verified': false
			}
		});
        // Set role (job-seeker/admin/employer)
        Roles.addUsersToRoles(id, "employer");
        // Send verification email
        Meteor.call("EMAIL_AccountCreationVerification", id, 'Employer');

		return id;
	},
	// Used to edit employer profile
	UTIL_EditEmployerProfile: function(userId, targetUserId, employerObj) {
		// authorize if it isSelf / isAdmin
		Meteor.call("AUTH_IsSelfOrAdmin", userId, targetUserId);

		Meteor.users.update({'_id':targetUserId}, {$set: {
				'profile.company_details': employerObj.company_details,
				'profile.contact_person_details': employerObj.contact_person_details
			}
		});
	}
});