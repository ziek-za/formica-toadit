// Search results for /search, type is job-seeker/employer.
Meteor.publish('search_users', function(selector, limit, start) {
	var options = {sort: {isoScore: -1, 'profile.total_pageviews':-1}, limit: limit, skip:start};
	return Meteor.users.find(selector, options);
});
// Profile for a registered user
// (Both employer and job-seeker)
Meteor.publish('profile', function(userId, currentUserId) {
	// Check to see if the user is viewing their own
	// profile
	if (currentUserId == userId) {
		 // Own profile
		 return Meteor.users.find({'_id':userId});
	} else {
		// Viewing another persons profile/not logged in
		return Meteor.users.find({'_id':userId});
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