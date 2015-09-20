SyncedCron.add({
  name: 'NotifyExpiringContracts - First day of every month',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('on the first day of the month');
  }, 
  job: function() {
    Meteor.call("TASK_NotifyExpiringContracts");
  }
});