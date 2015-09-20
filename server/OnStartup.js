Meteor.startup(function() {
	//Meteor.call("UTIL_AccountCreationVerificationEmail", '111', 'a@b.com');
	smtp = {
	    username: 'no-reply@toadit.com',   // eg: server@gentlenode.com
	    password: '17Reagola22',   // eg: 3eeP1gtizk5eziohfervU
	    server:   'pennywise.aserv.co.za',  // eg: mail.gandi.net
	    port: 465
	  }
	process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
	// Create root users if doesn't exist
	var exists = false;
	if (Meteor.users.find({'roles': {$in: ["root"]}}).count() > 0) { exists = true; }
	if (!exists) {
		console.log("[Root User does not exist, attempting to create]");
		var profile = {'personal_details': {
				'name': 'Root'
			}
		};
		var id = Accounts.createUser({
			email: 'root@toadit.com',
			password: '17Reagola22',
			profile: profile
		});
		// Add permissions
		Roles.addUsersToRoles(id, ['admin', 'root']);
		console.log("[Successfully created root user]");
	}
	// Start timed events
	SyncedCron.config({
	    // Log job run details to console
	    log: false,

	    // Use a custom logger function (defaults to Meteor's logging package)
	    logger: null,

	    // Name of collection to use for synchronisation and logging
	    collectionName: 'cronHistory',

	    // Default to using localTime
	    utc: false,
	    collectionTTL: 172800
	  });
	SyncedCron.start();
});
