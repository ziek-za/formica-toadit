Template.Registration_Conf.helpers({
	primaryEmail: function() { return this.emails[0].address; }
});

Template.Registration_Verification.helpers({
	complete: function() { return this.emails[0].verified; }
});