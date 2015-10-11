SearchSelector = function(search, type) {
	var selector = {};
	// Based on the type, use a unique specifier
	if (type == "job-seeker") {
		selector.$and = [];
		// ROLE
		selector.$and.push({ 'roles': {$in: ["job-seeker"]}});
		// STATE
		var typeArray = [];
		if (search.type.active) { typeArray.push('active'); }
		if (search.type.pending) { typeArray.push('pending'); }
		if (search.type.placed) { typeArray.push('placed'); }
		if (search.type.details_complete) { typeArray.push('details complete'); }
		if (search.type.details_pending) { typeArray.push('details pending'); }
		selector.$and.push(
			{'profile.status': {$in: typeArray}}
		);
		// QUERY
		if (search.query) {
			var regexQuery = sanitizeQueryForRegex(search.query);
			selector.$and.push(
				{$or: [
		      		{'profile.personal_details.name': {$regex: regexQuery, $options: "ig"}},
		      		{'profile.personal_details.surname': {$regex: regexQuery, $options: "ig"}}
		      	]}
			);
		}
		// PROVINCE
		if (search.province) {
			selector.$and.push(
				{ 'profile.personal_details.province': {$regex: search.province, $options: "ig"}}
			);
		}
		// ROLE REQUIREMENTS
		if (search.sap_module) {
			selector.$and.push(
				{ 'profile.role_requirements.sap_module': {$regex: search.sap_module, $options: "ig"}}
			);
		}
		if (search.industry) {
			selector.$and.push(
				{ 'profile.role_requirements.industry': {$regex: search.industry, $options: "ig"}}
			);
		}
		if (search.position.desired) {
			selector.$and.push(
				{ 'profile.role_requirements.desired_job': {$regex: search.position.desired , $options: "ig"}}
			);
		}
		// SALARY
		// current_salary
		if (search.current_salary.from &&
			!_.isNaN(search.current_salary.from)) {
			selector.$and.push(
				{'profile.salary_details.current': {$gte: search.current_salary.from}}
			);
		}
		if (search.current_salary.to &&
			!_.isNaN(search.current_salary.to)) {
			selector.$and.push(
				{'profile.salary_details.current': {$gte: search.current_salary.to}}
			);
		}
		// moveFor_salary
		if (search.moveFor_salary.from &&
			!_.isNaN(search.moveFor_salary.from)) {
			selector.$and.push(
				{'profile.salary_details.moveFor': {$gte: search.moveFor_salary.from}}
			);
		}
		if (search.moveFor_salary.to &&
			!_.isNaN(search.moveFor_salary.to)) {
			selector.$and.push(
				{'profile.salary_details.moveFor': {$gte: search.moveFor_salary.to}}
			);
		}
		// ideal_salary
		if (search.ideal_salary.from &&
			!_.isNaN(search.ideal_salary.from)) {
			selector.$and.push(
				{'profile.salary_details.ideal': {$gte: search.ideal_salary.from}}
			);
		}
		if (search.ideal_salary.to &&
			!_.isNaN(search.ideal_salary.to)) {
			selector.$and.push(
				{'profile.salary_details.ideal': {$gte: search.ideal_salary.to}}
			);
		}
		// SKILLS
		if (search.skills) {
			for (i = 0; i < search.skills.length; i++) {
				selector.$and.push(
					{'profile.role_requirements.skills.skill': search.skills[i].skill}
				);
				if (search.skills[i].years_experience &&
					!_.isNaN(search.skills[i].years_experience)) {
					selector.$and.push(
						{'profile.role_requirements.skills.years_experience': {$gte: search.skills[i].years_experience}}
					);
				}
			}
		}
    } else if (type == "employer") {
    	selector.$and = [];
		// ROLE
		selector.$and.push({ 'roles': {$in: ["employer"]}});
		// QUERY
		if (search.query) {
			selector.$and.push(
				{ 'profile.company_details.name': {$regex: search.query, $options: "ig"}}
			);
		}
		// PROVINCE
		if (search.province) {
			selector.$and.push(
				{ 'profile.company_details.province': {$regex: search.province, $options: "ig"}}
			);
		}	
		// VERIFIED COMPANIES
		if (!Roles.userIsInRole(Meteor.userId(), 'admin')) {
			selector.$and.push(
				{'profile.status': 'verified'}
			);
		}		
    }
    console.log(selector);
    return selector;
};

AdminSearchSelector = function(query) {
	var regexQuery = sanitizeQueryForRegex(query);
	var selector = {$and: [
		{$or: [
      		{'profile.personal_details.name': {$regex: regexQuery, $options: "ig"}},
      		{'profile.personal_details.surname': {$regex: regexQuery, $options: "ig"}}
      	]},
      	{ 'roles': {$in: ["admin", "revoked-admin"]}}
	]};
	return selector;
};


function sanitizeQueryForRegex(searchText) {
	if (searchText != "") {
		var parts = searchText.trim().split(/[ \-\:]+/);
		return "(" + parts.join('|') + ")";
	} else { return ".*/*.";} // returns all searches
};
function sanitizeQueryForProvinceRegex(searchText) {
	if (searchText != "") {
		var parts = searchText.trim().split(/[ \-\:]+/);
		return parts.join(' ');
	} else { return ".*/*."; }
};