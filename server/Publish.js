// Search results for /search, type is job-seeker/employer.
Meteor.publish('search_users', function(selector, limit, start) {
	var options = {sort: {isoScore: -1, 'profile.total_pageviews':-1}, limit: limit, skip:start};
	return Meteor.users.find(selector, options);
});
Meteor.publish('users', function(selector, options) {
	return Meteor.users.find(selector, options);
});
// Profile for a registered user
// (Both employer and job-seeker)
Meteor.publish('profile', function(userId, currentUserId, token) {
	currentUserId = this.userId;
	// Check if the user viewing the profile is an admin
	if (Roles.userIsInRole(currentUserId, 'admin') ||
		userId == currentUserId ||
		Roles.userIsInRole(userId, 'employer')) {
		return Meteor.users.find({'_id':userId});
	} else {
		if (token) {
			// check to see if token is valid
			var jobseeker = Meteor.users.findOne({'_id':userId});
			if (jobseeker.profile.request_tokens &&
				jobseeker.profile.request_tokens.length > 0) {
				for (i = 0; i < jobseeker.profile.request_tokens.length; i++) {
					if (jobseeker.profile.request_tokens[i].token == token) {
						//Meteor.call("UTIL_DeleteJobSeekerToken", userId, token);
						return Meteor.users.find({'_id':userId});
					}
				}
			}
		}
		return Meteor.users.find({'_id':userId}, {fields: {
			'profile.personal_details.cell_number': 0,
			'profile.personal_details.tel_number': 0,
			'profile.cv': 0,
			'emails': 0,
			'profile.request_tokens': 0
		}});
	}
});
Meteor.publish('roles', function (){
    return Meteor.roles.find({});
});

// Used for returning CV
Meteor.publish('profilecv', function(userId) {
	return CV.find({'metadata.targetUserId':userId});
});

// Test for upload
Meteor.publish('images', function(){ return Images.find(); });

// Queries
Meteor.publish('queries', function(selector, options) { return Queries.find(selector, options); });

// Vacancies
Meteor.publish('vacancies', function(selector, options) { return Vacancies.find(selector, options); });

// Selections
Meteor.publish('selections', function(selector, options) { return Selections.find(selector, options); })