// Vacancy home page
Template.homepageVacancyItem.helpers({
	formattedDate: function() {
		return this.vacancy.publish_date.format("dd/mm/yy");
	}
});

// Vacancy listing
Template.Vacancies_List.helpers({
	formattedDate: function() {
		return this.vacancy.publish_date.format("dd/mm/yy");
	}
});