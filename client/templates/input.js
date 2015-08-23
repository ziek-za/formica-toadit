Template.input.created = function() {
	// Set session variables for CV Input
	/*Session.set('change-cv-input', false);
	Session.set('remove-cv', false);*/
	// Set session variable to current value
	if (this.data.value) { Session.set(this.data.session, this.data.value); }
	else { Session.set(this.data.session, ''); }
	// Reset errors
	Session.set(this.data.session + '-error', false);
	Session.set(this.data.seed + 'input-error-display', false);
	Session.set(this.data.seed + 'input-error', false);
	var error_counter = Session.get(this.data.seed + 'input-error-counter');
	if (!error_counter) { Session.set(this.data.seed + 'input-error-counter', 0); }
	if (this.data.type == 'combobox') {
		// Reset combobox
		set_visibilty(this.data.session, false);
	}
	// Validate input
	var value = this.data.value;
	if (!value) { value = ""; }
	validate_input(this.data, value, false);
};
Template.input.helpers({
	required: function() { return this.required; },
	// Returns true if either display_error variable is true.
	display_error: function() {
		if (Session.get(this.seed + 'input-error-display') || (Session.get(this.session + '-error') && Session.get(this.session + '-error-keyup'))) {
			if (Session.get(this.session+'-error')) {
				return true;
			}
			return false;
		}
	},
	error: function() { return Session.get(this.session + '-error'); },
	// _+_+_+_+_+_+_+_+_+_+_+_+_+_+
	// _+_+_+_+_+COMBOBOX_+_+_+_+_+
	// _+_+_+_+_+_+_+_+_+_+_+_+_+_+
	results: function() { return Session.get(this.session + '-data'); },
	resultsVisible: function() { return Session.get(this.session+'-visibility'); },
	selectedOption: function() { return Session.get(this.session); },
	showClear: function() { return Session.get(this.session); },
	// _+_+_+_+_+_+_+_+_+_+_+_+_+_+
	// _+_+_+_+_+UPLOAD_+_+_+_+_+_+
	// _+_+_+_+_+_+_+_+_+_+_+_+_+_+
	toBeRemoved: function() { return Session.get('remove-cv'); }
});
Template.input.events({
	// _+_+_+_+_+_+_+_+_+_+_+_+_+_+
	// _+_+_+_+_+INPUT_+_+_+_+_+_+_
	// _+_+_+_+_+_+_+_+_+_+_+_+_+_+
	// Used to verify input
	"keyup .js-input-template": _.throttle(function(e, t) {
		var value = t.find('.js-input-template').value;
		if (validate_input(this, value, true)) { reset_errors(this.session, this.seed); }
	}, 200),
	// Used to set session variables for input
	"change .js-input-template, blur .js-input-template": function(e, t) {
		if (!Session.get(this.session + '-error')) {
			var value = t.find('.js-input-template').value;
			// Format inputted data
			var fvalue = format_input(this, value);
			Session.set(this.session, fvalue);
		}
	},
	// _+_+_+_+_+_+_+_+_+_+_+_+_+_+
	// _+_+_+_+_+COMBOBOX_+_+_+_+_+
	// _+_+_+_+_+_+_+_+_+_+_+_+_+_+
	// Used to search through inputted data
	"keyup .js-search-combobox": _.throttle(function(e, t) {
	 	var text = t.find('.js-search-combobox').value;
	 	if (this.type == "combobox-other") {
    		if (validate_input(this, text, true)) { reset_errors(this.session, this.seed); } else {
    			set_visibilty(this.session, false);
    			return;
			}
    		Session.set(this.session, text);
    	}
	 	if (text == "") { set_visibilty(this.session, false);return; } else { set_visibilty(this.session, true); }
        var display_data = [];
  		var regex = new RegExp("("+text+")", "ig");
        for (i = 0; i < this.data.length; i++) {
        	if (regex.test(this.data[i])) {
        		display_data.push(this.data[i]);
        	}
        }
        Session.set(this.session + '-data', display_data);
    }, 200),
    // Used to remove the current value
    "click .js-clear-combobox": function(e, t) {
    	Session.set(this.session, "");
    	t.find(".js-search-combobox").value = "";
    	validate_input(this, "", true);
    },
    // Check to see if an option was chosen, otherwise close combobox and
    // reset to selected value
    "blur .js-search-combobox": function(e, t) {
    	var value;

	    	value = Session.get(this.session);
	    	if (_.isUndefined(value)) { value = ""; }
	    	t.find('.js-search-combobox').value = value;
	    	if (validate_input(this, value, true)) { reset_errors(this.session, this.seed); }
    	
    	set_visibilty(this.session, false);
    },
    // Used to change the session variable for inputs other than
    // the provided search data
    "change .js-search-combobox": function(e ,t) {

    },
    // _+_+_+_+_+_+_+_+_+_+_+_+_+_+
	// _+_+_+_+_+UPLOAD_+_+_+_+_+_+
	// _+_+_+_+_+_+_+_+_+_+_+_+_+_+
	/*,"change .js-cv-input": function(e, t) {
		//Session.set('change-cv-input', true);
		var file = t.find('.js-cv-input').files[0];
		if (validate_input(this, file, true)) {
			reset_errors(this.session);
		}
		Session.set(this.session, String(file));
		console.log(Session.get(this.session));
	}*/
	// _+_+_+_+_+_+_+_+_+_+_+_+_+_+
	// _+_+_+_+_+CHECKBOX_+_+_+_+_+
	// _+_+_+_+_+_+_+_+_+_+_+_+_+_+
	"click .js-checkbox": function(e, t) {
		var bool = t.find(".js-checkbox").checked;
		Session.set(this.session, bool);
	}
});
	// input > inputComboboxOption
	Template.inputComboboxOption.events({
	    // Used to select a new option from the dropdown
	    "mousedown .js-input-option": function(e, t) {
    		Session.set(Template.parentData(1).session, this.toString());
	    }
	});
	// input > inputDropdownOption
	Template.inputDropdownOption.events({
		// Used to select a new option from the dropdown
	    "mousedown .js-input-option": function(e, t) {
			Session.set(Template.parentData(1).session, this.toString());
	    }
	});
	Template.inputDropdownOption.helpers({
		selected: function() {
			var value = Template.parentData(1).value;
			if (this.toString() == value) { return true; }
			return false;
		}
	});

// GLOBAL FUNCTION
Input_check_errors = function(seed) {
	Session.set(seed + 'input-error-display', false);
	var error_counter = Session.get(seed + 'input-error-counter');
	console.log("Entering 'Input_check_errors' with error counter of " + error_counter + " and seed of " + seed);
	if (error_counter != 0) { 
		Session.set(seed + 'input-error-display', true);
		Session.set(seed + 'input-error', true);
		return false;
	} else { Session.set(seed + 'input-error', false); }
	return true;
};
// LOCAL FUNCTIONS
var format_input = function(inputData, value) {
	var rvalue = value;
	// If input type is a number then remove all spaces
	if (inputData.type == "contactNumber" ||
		inputData.type == "rand") {
		rvalue = value.replace(/\s+/g, '')
	}
	return rvalue;
};
var validate_input = function(inputData, value, isKeyUp) {
	var label = inputData.label;
	if (!label) {
		if (!inputData.placeholder) {
			label = "This field";
		} else { label = inputData.placeholder; }
	}
	// the call to this method has been called through a keyup method
	Session.set(inputData.session + '-error-keyup', isKeyUp);
	// GENERIC CHECKS
	// check if is required
	if (inputData.required) {
		if (value == "") {
			console.log("Setting error for 'required field'");
			set_errors(inputData.session, "<i>"+ label + "</i> is required", isKeyUp, inputData.seed);
			return false;
		}
	}
	// check to see if it adheres to limit
	// 'Greater Than Limit'
	// (default is 0)
	var gtlimit;
	if (inputData.gtlimit) { gtlimit = inputData.gtlimit; } else { gtlimit = 0; }
	if (value.length < gtlimit) {
		set_errors(inputData.session, "Character limit must be greater than <strong>" + gtlimit + "</strong>", isKeyUp, inputData.seed);
		return false;
	}
	// (default is 100)
	var limit;
	if (inputData.limit) { limit = inputData.limit; } else { limit = 100; }
	if (value.length > limit) {
		set_errors(inputData.session, "Exceeds character limit of <strong>" + limit + "</strong>", isKeyUp, inputData.seed);
		return false;
	}
	// TYPE SPECIFIC CHECKS
	if (inputData.type == "contactNumber" ||
		inputData.type == "rand") {
		if (value == "") { return true; }
		// check to see if it only contains numbers
		//value = parseInt(value);
		if (inputData.type == "rand") {
			// convert to string to remove empty spaces if possible
			value = value.toString();
		}
		if (!/^\d+$/.test(value.replace(/ /g,''))) {
			console.log(value + " is not an int");
			set_errors(inputData.session, "<i>" + label + "</i> is required to be a <strong>number</strong>", isKeyUp, inputData.seed);
			return false;
		}
	} else if (inputData.type == "email") {
		// check to see if is a valid email
		if (!validateEmail(value)) {
			set_errors(inputData.session, "Invalid email address", isKeyUp, inputData.seed);
			return false;
		}
		if (!inputData.skipInUse) {
			// check to see if it is avaiable
			Meteor.call("UTIL_EmailAvailable", value, function(err, bool) {
				if (!bool) {
					set_errors(inputData.session, "Email is all ready <strong style='text-decoration:underline;'>in use.</strong>", isKeyUp, inputData.seed);
				}
			});
		}
	}
	return true;
}
var reset_errors = function(sessionPrefix, seed) {
	console.log("reset errors being called");
	// check to see if it previously had an error
	if (Session.get(sessionPrefix + '-error')) {
		var errorCounter = Session.get(seed + 'input-error-counter');
		errorCounter--;
		if (errorCounter == 0) { Session.set(seed + 'input-error', false); }
		Session.set(seed + 'input-error-counter', errorCounter);
	}
	Session.set(sessionPrefix + '-error', false);
};
var set_errors = function(sessionPrefix, error, isKeyUp, seed) {
	if (!Session.get(sessionPrefix+'-error')) {
		// increment error counter only when the input
		// doesn't have an error
		var errorCounter = Session.get(seed + 'input-error-counter');
		errorCounter++;
		console.log("errorcounter: " + errorCounter);
		Session.set(seed + 'input-error-counter', errorCounter);
	}
	if (isKeyUp) { Session.set(seed + 'input-error', true); }
	Session.set(sessionPrefix+'-error', error);
};
var set_visibilty = function(sessionPrefix, bool) {
	Session.set(sessionPrefix+'-visibility', bool);
};
