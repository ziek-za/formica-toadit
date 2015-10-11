Template.Selections.helpers({
	selectionSize: function() { if (this.selection) { return this.selection.length; } else { return 0; } }
});

	// Selections > Selections_View > selectionItem
	Template.selectionItem.helpers({
		user: function() {
			var userId = this.toString();
			var currentUserId = Meteor.userId();
			Meteor.subscribe('profile', userId, currentUserId);
			return Meteor.users.findOne({'_id':userId});
		}
	});