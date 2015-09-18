// HOME (DASHBOARD)
Template.Admin_Home.helpers({
    queriesEmp: function() {
        // Get queries for employers from today and yesterday
        var yd = new Date();
        var tdUTC = new Date(Date.UTC(yd.getFullYear(), yd.getMonth() + 1, yd.getDate() - 2, 0,0,0));
        selector = {'type': 'employer', 'x': {$gt: tdUTC}};
        options = {limit: 2};
        Meteor.subscribe('queries', selector, options);
        return Queries.find(selector, options).fetch();
    },
    queriesJS: function() {
        // Get queries for employers from today and yesterday
        var yd = new Date();
        var tdUTC = new Date(Date.UTC(yd.getFullYear(), yd.getMonth() + 1, yd.getDate() - 2, 0,0,0));
        selector = {'type': 'job-seeker', 'x': {$gt: tdUTC}};
        options = {limit: 2};
        Meteor.subscribe('queries', selector, options);
        return Queries.find(selector, options).fetch();
    }
});
    Template.dashboardQueryItem.helpers({
        dateF: function(date) { return date.format("dddd, mmm yy"); }
    });
// USERS
Template.Admin_Users.created = function() {
	Session.set('admin-search', '');
};
Template.Admin_Users.helpers({
	results: function() {
		// Get the search query
		var query = Session.get('admin-search');
		// Generate the selector
		var selector = AdminSearchSelector(query);
		var limit = 5;
		// Subscribe to users
		Meteor.subscribe('search_users', selector, limit);
		// Fetch users
		return Meteor.users.find(selector).fetch();
	}
});
Template.Admin_Users.events({
	// Generates a new admin, first name/surname/email is required.
    // A password will be generated.
    "click .js-generate-admin": function(e, t) {
    	// Admin profile
    	var admin = {
    		'personal_details': {}
    	};
    	// Read in values
    	admin.personal_details.name = t.find('.js-admin-first-name').value;
    	admin.personal_details.surname = t.find('.js-admin-surname').value;
    	var email = t.find('.js-admin-email').value;

    	// Call to generate admin
        var userId = Meteor.userId();
    	Meteor.call("UTIL_CreateNewAdmin", userId, admin, email, function(err) {
    		if (err) {
    			Notify("Error creating administration: " + err.error, "fail");
    		} else {
    			t.find('.js-admin-first-name').value = "";
    			t.find('.js-admin-surname').value = "";
    			t.find('.js-admin-email').value = "";
    			Notify("Succesfully generated admin <strong>" + admin.personal_details.name + " " + admin.personal_details.surname + "</strong>", "success");
    		}
    	});
    },
	// Used for searching through current admin staff
	"keyup .js-search": _.throttle(function(e, t) {
        var text = t.find('.js-search').value;
        Session.set('admin-search', text);
    }, 200)
});
	//Admin_Users > AdministrationListItem
	Template.administrationListItem.helpers({
		email: function() {
			return this.emails[0].address;
		}
	});