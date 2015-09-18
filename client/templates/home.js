Template.Home.helpers({
	vacancies: function() {
		selector = {'published':true}; options = {limit:5, sort: {'vacancy.publish_date': -1}};
		Meteor.subscribe("vacancies", selector, options);
		return Vacancies.find(selector, options).fetch();
	}
});