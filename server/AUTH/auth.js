var PD = new Meteor.Error("Permission denied, you don't have ROOT/ADMIN priviledges");
var PD_SELF = new Meteor.Error("Permission denied, it is required to be your own profile in order to make changes to this field");
var PD_ROOT = new Meteor.Error("Permission denied, you don't have ROOT privilideges.");

Meteor.methods({
	AUTH_IsAdmin: function(userId) {
		if (!Roles.userIsInRole(userId, 'root')) {
			if (!Roles.userIsInRole(userId, 'admin')) {
				throw PD;
			}
		}
	},
	AUTH_IsRoot: function(userId) {
		if (!Roles.userIsInRole(userId, 'root')) { throw PD_ROOT; }
	},
	AUTH_IsSelfOrAdmin: function(userId, targetUserId) {
		if (userId != targetUserId) { Meteor.call("AUTH_IsAdmin", userId); }
	},
	AUTH_IsSelf: function(userId, targetUserId) {
		if (userId != targetUserId) { throw PD_SELF; }
	},
	AUTH_IsSelfOrRootAdmin: function(userId, targetUserId) {
		if (userId != targetUserId) {
			Meteor.call("AUTH_IsRoot", userId);
		}
	}
});