SearchSelector = function(search, type) {
	//console.log(search);
	var regexQuery = sanitizeQueryForRegex(search.query);
	var regexProvince = sanitizeQueryForProvinceRegex(search.province);
	var selector = {};
	// Based on the type, use a unique specifier
	if (type == "job-seeker") {
		var regexDesiredPos = sanitizeQueryForRegex(search.position.desired);
		var typeArray = [];
		if (search.type.active) { typeArray.push('active'); }
		if (search.type.pending) { typeArray.push('pending'); }
		if (search.type.placed) { typeArray.push('placed'); }
	    selector = {$and: [
	    	// Ensure that their profile is 'active' and thus is listed
	    	{ 'profile.status': {$in: typeArray}},
    		// Personal details (name & surname)
	      	{$or: [
	      		{'profile.personal_details.name': {$regex: regexQuery, $options: "ig"}},
	      		{'profile.personal_details.surname': {$regex: regexQuery, $options: "ig"}}
	      	]},
	      	// Province
	      	{ 'profile.personal_details.province': {$regex: regexProvince, $options: "ig"}},
	      	// Position
	      	{ 'profile.role_requirements.desired_job': {$regex: regexDesiredPos, $options: "ig"}},
	      	// Salary
	      	{$and: [
	      		// Current salary
	      		{'profile.salary_details.current': {$gte: search.current_salary.from}},
	      		{'profile.salary_details.current': {$lte: search.current_salary.to}},
	      		// MoveFor salary
	      		{'profile.salary_details.moveFor': {$gte: search.moveFor_salary.from}},
	      		{'profile.salary_details.moveFor': {$lte: search.moveFor_salary.to}},
	      		// Ideal salary
	      		{'profile.salary_details.ideal': {$gte: search.ideal_salary.from}},
	      		{'profile.salary_details.ideal': {$lte: search.ideal_salary.to}}
	      	]},
	      	// Job seeker
	      	{ 'roles': {$in: ["job-seeker"]}}
	    ]};
    } else if (type == "employer") {
    	selector = {$and: [
	      	{ 'profile.company_details.name': {$regex: regexQuery, $options: "ig"}},
	      	// Province
	      	{ 'profile.company_details.province': {$regex: regexProvince, $options: "ig"}},
	      	{ 'roles': {$in: ["employer"]}}
	    ]};
    }
    //console.log(selector);
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