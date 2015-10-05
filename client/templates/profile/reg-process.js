Template.Registration_Conf.helpers({
	primaryEmail: function() { return this.emails[0].address; }
});

Template.Registration_Verification.helpers({
	complete: function() { if(this.emails) { return this.emails[0].verified; } else { return false; }}
});