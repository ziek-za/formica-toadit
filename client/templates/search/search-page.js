Template.Search.created = function() {
	Session.set('limit', 15);
	Session.set('page', 1);
	Session.set('ready', false);
	Session.set('total', false);
}
Template.Search.helpers({
	searchType: function() {
		var search = Session.get('searchType');
		if (search == 'job-seeker') { return 'job seeker'; }
		return search;
	},
	searchQuery: function() {
		return Session.get('search').query;
	},
	searchingForJobSeeker: function() {
		return Session.get('searchType') == 'job-seeker';
	},
	results: function() {
		var limit = Session.get('limit');
		var page = Session.get('page');
		var start = (page - 1) * limit;
		// Get session search variables
		var search = Session.get('search');
		var search_type = Session.get('searchType');
		// Generate Selector
		var selector = SearchSelector(search, search_type);
		// Subscribe to results
		Meteor.subscribe('search_users', selector, limit, start, {
			onReady: function() { Session.set('ready', true); }
		});
		// Return results
		var results = Meteor.users.find(selector);
		var total = results.count(); Session.set('total', total);
		return results.fetch();
	},
	page: function() { return Session.get('page'); },
	ready: function() { return Session.get('ready'); },
	total: function() { return Session.get('total'); }
});
Template.Search.events({
	"click .js-page-right": function(e, t) {
		var page = Session.get('page') + 1;
		Session.set('page', page);
	},
	"click .js-page-left": function(e, t) {
		var page = Session.get('page') - 1;
		if (page < 2) { page = 1; }
		Session.set('page', page);
	}
});

	// Search > SearchDisplay_JS
	Template.SearchDisplay_JS.events({
		// Used to navigate to job seeker profile
		"click .js-view-profile": function(e, t) {
			window.open(Router.url("Profile", {_id:this._id}));
		}
	});
	Template.SearchDisplay_Emp.events({
		// Used to navigate to job seeker profile
		"click .js-view-profile": function(e, t) {
			window.open(Router.url("Profile", {_id:this._id}));
		}
	});

// SPECIFIC SEARCHES
	// JOB SEEKER
	Template.SearchFields_JS.helpers({
		provinces: function() { return PROVINCES(); },
		positions: function() { return JOBS(); },
		sapModules: function() { return SAP_MODULES; },
		industries: function() { return INDUSTRIES; }
	});
	Template.SearchFields_JS.events({
		"submit": function(e, t)  {
			e.preventDefault();
			var search = Session.get('search');
			// SEARCH DETAILS
			search.query = Session.get('search-query');
			// SALARY
			// Current
			search.current_salary.from = AssignFrom(parseInt(Session.get('current-high')));
			search.current_salary.to = AssignTo(parseInt(Session.get('current-low')));
			// MoveFor
			search.moveFor_salary.from = AssignFrom(parseInt(Session.get('movefor-high')));
			search.moveFor_salary.to = AssignTo(parseInt(Session.get('movefor-low')));
			// Ideal
			search.ideal_salary.from = AssignFrom(parseInt(Session.get('desired-high')));
			search.ideal_salary.to = AssignTo(parseInt(Session.get('desired-low')));
			// Province
			search.province = Session.get('search-province');
			// Roles requirements
			search.position.desired = Session.get('search-desired-position');
			search.sap_module = Session.get('search-sap-module');
			search.industry = Session.get('search-industry');
			// Type
			search.type.active = Session.get('set-active');
			search.type.pending = Session.get('set-pending');
			search.type.placed = Session.get('set-placed');
			//console.log(search);
			// Search
			Session.set('search', search);
			Session.set('ready', false);
			//window.setInterval(function() { Session.set('ready',true); }, 500);
			// Log search query
			Meteor.call("UTIL_LogQuery", search, 'job-seeker');
			return false;
		}
	});
	// EMPLOYER
	Template.SearchFields_Emp.helpers({
		provinces: function() {
			return PROVINCES();
		}
	});
	Template.SearchFields_Emp.events({
		"submit": function(e, t)  {
			e.preventDefault();
			var search = Session.get('search');
			// Get search query
			search.query = Session.get('search-query');
			// Get province
			search.province = Session.get('search-province');
			// Search
			Session.set('search', search);
			Session.set('ready', false);
			//window.setInterval(function() { Session.set('ready',true); }, 500);
			// Log search query
			Meteor.call("UTIL_LogQuery", search, 'employer');
			return false;
		}
	});

	// HELPERS FUCNTIONS
	AssignTo = function(input) {
		if (_.isNaN(input)) { return Number.MAX_SAFE_INTEGER; }
		return input;
	}
	AssignFrom = function(input) {
		if (_.isNaN(input)) { return 0; }
		return input;
	}