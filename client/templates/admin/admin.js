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
    Session.set('contract-months', 3);
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
	},
    contracts: function() {
        var months = parseInt(Session.get('contract-months'));
        // Get contracts which expire within 3 months time
        var date = new Date(); date.setMonth(date.getMonth() + months);
        var selector = {
            $and: [
                {'profile.status': 'placed'},
                {'profile.progress.deployment.end': {$lt: date}},
                {'profile.progress.deployment.end': {$gt: new Date()}}
            ]
        };
        var options = {sort: {'profile.progress.deployment.end': 1}};
        Meteor.subscribe('users', selector, options);
        return Meteor.users.find(selector, options).fetch();
    },
    months: function() { return Session.get("contract-months"); }
});
Template.Admin_Users.events({
    // Used to change the contract expiry date
    "blur .js-months, change .js-months": function(e,t) {
        Session.set('contract-months', t.find('.js-months').value);
    },
	// Generates a new admin, first name/surname/email is required.
    // A password will be generated.
    "submit form": function(e, t) {
        alert();
        e.preventDefault();
    	// Admin profile
    	var admin = {
    		'personal_details': {}
    	};
    	// Read in values
    	admin.personal_details.name = e.target.firstName.value;
    	admin.personal_details.surname = e.target.surname.value;
    	var email = e.target.email.value;

    	// Call to generate admin
        var userId = Meteor.userId();
    	Meteor.call("UTIL_CreateNewAdmin", userId, admin, email, function(err) {
    		if (err) {
    			Notify("Error creating administration: " + err.error, "fail");
    		} else {
    			e.target.firstName.value = "";
    			e.target.surname.value = "";
    			e.target.email.value = "";
    			Notify("Succesfully generated admin <strong>" + admin.personal_details.name + " " + admin.personal_details.surname + "</strong>. An Email has been sent to them.", "success");
    		}
    	});

        return false;
    },
	// Used for searching through current admin staff
	"keyup .js-search": _.throttle(function(e, t) {
        var text = t.find('.js-search').value;
        Session.set('admin-search', text);
    }, 200)
});
    // Admin_Users > contractUserItem
    Template.contractUserItem.helpers({
        timeRemaining: function() {
            var dateFuture = this.profile.progress.deployment.end; var dateNow = new Date();
            if (dateFuture < dateNow) { return false; }
            var seconds = Math.floor((dateFuture - (dateNow))/1000);
            var minutes = Math.floor(seconds/60);   
            var hours = Math.floor(minutes/60);
            var days = Math.floor(hours/24);
            var months = Math.floor(days/30);
            hours = hours-(days*24);
            days = days - (months * 30);
            var day_suffix = " day";
            if (days > 1 || days < 1) { day_suffix += "s"; }
            var month_suffix = " month";
            if (months > 1 || months < 1) { month_suffix += "s"; }
            return months + month_suffix + ", " + days + day_suffix;
        },
        date: function() { return this.profile.progress.deployment.start.format("dd/mm") + " - " + this.profile.progress.deployment.end.format("dd/mm/yyyy"); }
    });
	// Admin_Users > AdministrationListItem
	Template.administrationListItem.helpers({
		email: function() {
			return this.emails[0].address;
		}
	});