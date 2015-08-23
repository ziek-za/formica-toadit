// Collection used for storing search queries
Queries = new Meteor.Collection('queries');

var imageStore = new FS.Store.GridFS('images');

Images = new FS.Collection('images', {
 stores: [imageStore]
});

Images.deny({
 insert: function(){
 return false;
 },
 update: function(){
 return false;
 },
 remove: function(){
 return false;
 },
 download: function(){
 return false;
 }
 });

Images.allow({
 insert: function(){
 return true;
 },
 update: function(){
 return true;
 },
 remove: function(){
 return true;
 },
 download: function(){
 return true;
 }
});

var CVStore = new FS.Store.GridFS('cv');

CV = new FS.Collection('cv', {
 stores: [CVStore],
 //only allow .PDF
 filter: {
 	maxSize: 16777216, // 16MB file upload
 	allow: {
 		extensions: ['pdf']
 	},
 	onInvalid: function(message) {
 		if (Meteor.isClient) {
  			Notify("Error in uploading file: " + message, "fail");
		} else { console.log(message); }
 	}
 }
});

CV.deny({
 insert: function(){
 return false;
 },
 update: function(){
 return false;
 },
 remove: function(){
 return false;
 },
 download: function(){
 return false;
 }
 });

CV.allow({
 insert: function() {
 return true;
 },
 update: function(){
 return true;
 },
 remove: function(userId, obj){
 	// Only allow the image to be removed if the user is an admin
 	// OR the user is removing their own CV
 	if (Roles.userIsInRole(userId, 'admin') ||
 		obj.metadata.targetUserId == userId) {
 		// Remove from user
 		Meteor.call("UTIL_RemoveCV", obj.metadata.targetUserId, obj._id);
 		return true;
 	} else {
 		return false;
 	}
 },
 download: function(){
 return true;
 }
});