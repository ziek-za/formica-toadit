// Vacancies
Template.Admin_Vacancies_List.helpers({
	formattedDate: function() { return this.vacancy.publish_date.format("mmm d, yyyy"); }
});
	// Vacancy > Edit
	Template.Admin_Vacancies_Edit.rendered = function() {
		$('#publish-datepicker').datepicker({
	    	todayHighlight: true
	    });
	};
	Template.Admin_Vacancies_Edit.events({
		"submit, click .js-save": function(e,t) {
			e.preventDefault();

			// Get form inputs and create a vacancy object
			var vacancy = {
				'description': t.find(".js-description").value,
				'publish_date': new Date(t.find(".js-publish-date").value),
				'link': t.find(".js-link").value,
				'title': t.find(".js-title").value
			}
			var vacancyId = this._id;
			Meteor.call("UTIL_SaveVacancy", vacancyId, vacancy, function(err) {
				if (err) { alert("Error in saving vacancy changes: " + err.error); }
				else { alert("Saved changes!"); }
			});

			return false;
		},
		// Used to toggle the vacancy publish status
		"click .js-toggle-publish": function(e, t) {
			e.preventDefault();

			var vacancyId = this._id;
			Meteor.call("UTIL_ToggleVacancyPublish", vacancyId, function(err) {
				if (err) { alert("Error toggling publish status: " + err.error); }
			});

			return false;
		},
		// Used to remove a vacancy
		"click .js-remove": function(e,t) {
			e.preventDefault();

			var vacancyId = this._id;
			Meteor.call("UTIL_RemoveVacancy", vacancyId, function(err) {
				if (err) { alert("There was an error with removing a vacancy: " + err.error); }
				else { Router.go("Admin_Vacancies_List"); alert("Successfully removed vacancy!"); }
			});

			return false;
		}
	});
	// Vacancy > New
	Template.Admin_Vacancies_New.rendered = function() {
	    $('#publish-datepicker').datepicker({
	    	todayHighlight: true
	    });
	};
	Template.Admin_Vacancies_New.events({
		"submit": function(e,t) {
			e.preventDefault();
			// Get form inputs and create a vacancy object
			var vacancy = {
				'description': t.find(".js-description").value,
				'publish_date': new Date(t.find(".js-publish-date").value),
				'link': t.find(".js-link").value,
				'title': t.find(".js-title").value
			}
			Meteor.call("UTIL_CreateNewVacancy", vacancy, function(err, id) {
				if (err) {
					alert("Error saving your vacancy: " + err.error);
				} else if (id) {
					Router.go('Admin_Vacancies_Edit', {_id: id});
					alert("Successfully created vacancy!");
				}
			});
			return false;
		}
	});