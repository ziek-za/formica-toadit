Template.Search.created = function() {
	Session.set('limit', 15);
	Session.set('page', 1);
	Session.set('ready', false);
	Session.set('total', false);
	Session.set("creating-selection", false);
	Session.set("selection", []);
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
	total: function() { return Session.get('total'); },
	// Used for creating selections of job seekers
	creatingSelection: function() { return Session.get("creating-selection"); },
	savingSelection: function() { return Session.get('saving-selection'); }
});
Template.Search.events({
	// Used to create a selection of job seekers
	"click .js-create-selection": function() { 
		// Set the session to 'creating selection'
		Session.set("creating-selection", true);
	},
	"click .js-cancel-selection": function() {
		Session.set("creating-selection", false);
		Session.set("selection", []);
	},
	"click .js-save-selection": function() { 
		var selection = Session.get("selection");
		if (!selection || selection.length == 0) {
			Notify("Unabled to save with no users in selection!", "fail");
			return;
		}
		Session.set('saving-selection', true);
		Meteor.call("UTIL_CreateSelection", selection, function(err, id) {
			if (err) { Notify("Error saving selection: " + err.message, "fail"); }
			else {
				Session.set("selection", []);
				Notify("Successfully saved selection!", "success");
				Router.go("Selections_View", {'_id':id});
			}
			Session.set('saving-selection', false);
		});
	},
	// Used for navigating search results
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
	Template.SearchDisplay_JS.helpers({
		creatingSelection: function() { return Session.get("creating-selection"); },
		existsInSelection: function() { 
			var selection = Session.get('selection');
			var jobSeekerId = this._id;
			if (_.contains(selection, jobSeekerId)) { return true; }
			return false;
		}
	});
	Template.SearchDisplay_JS.events({
		// Used to navigate to job seeker profile
		"click .js-view-profile": function(e, t) {
			window.open(Router.url("Profile", {_id:this._id}));
		},
		// Used for adding job seekers to selection array
		"click .js-add": function() { 
			var selection = Session.get('selection');
			var jobSeekerId = this._id;
			if (!_.contains(selection, jobSeekerId)) { selection.push(jobSeekerId); }
			Session.set('selection', selection);
		},
		// Used to remove job seekers from existing selection
		"click .js-remove": function() { 
			var selection = Session.get('selection');
			var jobSeekerId = this._id;
			if (selection) {
				for (i = 0; i < selection.length; i++) {
					if (selection[i] == jobSeekerId) { selection.splice(i, 1); }
				}
				Session.set('selection', selection);
			}
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
		industries: function() { return INDUSTRIES; },
		ITSkills: function() { return IT_SKILLS; }
	});
	Template.SearchFields_JS.events({
		"submit": function(e, t)  {
			e.preventDefault();
			var search = Session.get('search');
			// SEARCH DETAILS
			search.query = Session.get('search-query');
			// SALARY
			// Current
			search.current_salary.from = parseInt(Session.get('current-high'));
			search.current_salary.to = parseInt(Session.get('current-low'));
			// MoveFor
			search.moveFor_salary.from = parseInt(Session.get('movefor-high'));
			search.moveFor_salary.to = parseInt(Session.get('movefor-low'));
			// Ideal
			search.ideal_salary.from = parseInt(Session.get('desired-high'));
			search.ideal_salary.to = parseInt(Session.get('desired-low'));
			// Province
			search.province = Session.get('search-province');
			// Roles requirements
			search.position.desired = Session.get('search-desired-position');
			search.sap_module = Session.get('search-sap-module');
			search.industry = Session.get('search-industry');
			// Type
			if (Roles.userIsInRole(Meteor.userId(), 'admin')) {
				search.type.active = Session.get('set-active');
				search.type.pending = Session.get('set-pending');
				search.type.placed = Session.get('set-placed');
				search.type.details_complete = Session.get('set-details-complete');
				search.type.details_pending = Session.get('set-details-pending');
			} else {
				search.type.active = true;
			}
			// Skills
			search.skills = Session.get('search-it-skills');
			// Search
			Session.set('page', 1);
			Session.set('search', search);
			Session.set('ready', false);
			// Log search query
			Meteor.call("UTIL_LogQuery", search, 'job-seeker');
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
			Session.set('page', 1);
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