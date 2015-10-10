Template.Register_Emp.created = function() {
	Session.set('processing', false);
	Session.set('password-error', false);
};
Template.Register_Emp.helpers({
	errors: function() { return Session.get('qweinput-error'); },
	passwordError: function() { return Session.get("password-error"); },
	provinces: function() { return PROVINCES(); },
	processing: function() { return Session.get('processing'); }
});
Template.Register_Emp.events({
	"submit": function(e, t) {
		e.preventDefault();
		// verify input
			var ie = false;
			if (!Input_check_errors('qwe')) { ie = true; }
		// --------	
		var employer = {
			'company_details': {},
			'contact_person_details': {},
			'misc': {},
			'picture': {
				'regular': '/style/images/default_employer_profile.jpg',
				'thumbnail': '/style/images/default_employer_profile.jpg'
			},
			'status': 'pending verification'
		};
		// ACCOUNT DETAILS
		var email = Session.get('reg-email');
		var password_1 = Session.get('reg-password-1');
		var password_2 = Session.get('reg-password-2');
		// verify password input
			if (password_1 != password_2) { Session.set('password-error', 'The provided passwords do not match.'); ie = true; }
		// --------
		if (ie) { return; }
		// COMPANY DETAILS
		employer.company_details.name = Session.get('reg-company-name');
		employer.company_details.tel_number = Session.get('reg-company-number');
		employer.company_details.province = Session.get('reg-province');
		// CONTACT PERSON DETAILS
		employer.contact_person_details.name = Session.get('reg-name');
		employer.contact_person_details.surname = Session.get('reg-surname');
		employer.contact_person_details.contact = Session.get('reg-contact');
		// Create Employer
		var portal = this.key;
		// Set 'processing' to true
		Session.set('processing', true);
		Meteor.call("UTIL_CreateNewEmployer", employer, email, password_1, function(err, employerId) {
			if (err) {
				console.log("Employer register error: " + err.error);
			} else if (employerId) {
				if (!err) { Router.go('Login', {_portal: portal}, {query: 'registrationSuccess=true'}); }
			}
		});

		return false;
	},
	// Used to cancel changes
	"click .js-cancel": function(e, t) {
		Router.go("Login", {_portal:'employer'});
	}
});