// Collection used for storing search queries
Queries = new Meteor.Collection('queries');
// Collection used for storing vacancies
Vacancies = new Meteor.Collection('vacancies');
// Collection used for storing selections of job seekers
Selections = new Meteor.Collection('selections');
// Used for storying images
var imageStore = new FS.Store.GridFS('images');
Images = new FS.Collection('images', {
 stores: [imageStore],
 filter: {
 	maxSize: 6777216, // 6MB file upload
 	allow: {
 		extensions: ['png', 'jpeg', 'jpg']
 	},
 	onInvalid: function(message) {
 		if (Meteor.isClient) {
  			Notify("Error in uploading file: " + message, "fail");
		} else { console.log(message); }
 	}
 }
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
 remove: function(userId, obj){
 	// Only allow the image to be removed if the user is an admin
 	// OR the user is removing their own CV
 	if (Roles.userIsInRole(userId, 'admin') ||
 		obj.metadata.targetUserId == userId) {
 		// Remove from user
 		Meteor.call("UTIL_RemoveImage", obj.metadata.targetUserId, obj._id);
 		return true;
 	} else {
 		return false;
 	} 
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