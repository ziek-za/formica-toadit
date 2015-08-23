// Data passed in
// {data: 'Data to repeat over',
//  session: 'Session variable to store clicked value in'}

Template.combobox.created = function() {
	var array = this.data.data.data;
	var result_array = [];
	for (i = 0; i < array.length; i++) {
		result_array.push({display: array[i], value: array[i]});
	}
	Session.set('combobox-' + this.data.data.session + '-data', result_array);
	Session.set('combobox-' + this.data.data.session + '-data-backup', result_array);
	Session.set('combobox-' + this.data.data.session + '-visibility', false);
	if (this.data.data.value) {
		Session.set(this.data.data.session, this.data.data.value);
	} else {
		Session.set(this.data.data.session, '');
	}
};

Template.combobox.helpers({
	data: function() {
		return Session.get('combobox-' + this.data.session + '-data');
	},
	visible: function() {
		return Session.get('combobox-' + this.data.session + '-visibility');
	},
	noResults: function() {
		var data = Session.get('combobox-' + this.data.session + '-data');
		if (data.length == 0) { return true; }
		return false;
	},
	placeholder: function() {
		return this.data.placeholder;
	},
	selectedItem: function() {
		var item = Session.get(this.data.session);
		if (_.isUndefined(item) || item == '') {
			if (this.data.value) { return this.data.value; }
			return "";
		}
		return item;
	}
});
Template.combobox.events({
	"click .js-clear-combobox": function(e, t) {
		Session.set(this.data.session, '');
		Session.set('combobox-' + this.data.session + '-visibility', false);
	},
	"click .js-dropdown": function(e, t) {
		var visible = Session.get('combobox-' + this.data.session + '-visibility');
		if (_.isUndefined(visible)) { visible = true; }
		else { visible = !visible; }
		Session.set('combobox-' + this.data.session + '-visibility', visible);
	},
	 "keyup .js-search": _.throttle(function(e, t) {
	 	var text = t.find('.js-search').value;
	 	if (text == "") {
	 		Session.set('combobox-' + this.data.session + '-visibility', false);
	 		Session.set('combobox-' + this.data.session + '-data', Session.get('combobox-' + this.data.session + '-data-backup'));
	 		return;
	 	} else 
	 	// Display the dropdown
	 	{ Session.set('combobox-' + this.data.session + '-visibility', true); }
        // Create regex
        var data = [];//this.data.slice();

        //var parts = text.trim().split(/[ \-\:]+/);
  		var regex = new RegExp("("+text+")", "ig");
        for (i = 0; i < this.data.data.length; i++) {
        	if (regex.test(this.data.data[i])) {
        		data.push({display: this.data.data[i].replace(regex, "<strong style='text-decoration:underline;'>"+text+"</strong>"),
        			value: this.data.data[i]});
        	}
        }
        Session.set('combobox-' + this.data.session + '-data', data);
    }, 200)
});

	// COMBOBOX ITEM
	Template.comboboxItem.helpers({
		clickSession: function() {
			return Template.parentData(1).data.session;
		}
	});
	Template.comboboxItem.events({
		"click .js-combobox-session": function(e, t) {
			Session.set(Template.parentData(1).data.session, this.value.toString());
			Session.set('combobox-' + Template.parentData(1).data.session + '-visibility', false);
		}
	});