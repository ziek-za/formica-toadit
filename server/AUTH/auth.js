var PD = new Meteor.Error("Permission denied, you don't have ROOT/ADMIN priviledges");
var PD_SELF = new Meteor.Error("Permission denied, it is required to be your own profile in order to make changes to this field");

Meteor.methods({
	AUTH_IsAdmin: function(userId) {
		if (!Roles.userIsInRole(userId, 'root')) {
			if (!Roles.userIsInRole(userId, 'admin')) {
				throw PD;
			}
		}
	},
	AUTH_IsSelfOrAdmin: function(userId, targetUserId) {
		if (userId != targetUserId) { Meteor.call("AUTH_IsAdmin", userId); }
	},
	AUTH_IsSelf: function(userId, targetUserId) {
		if (userId != targetUserId) { throw PD_SELF; }
	}
});