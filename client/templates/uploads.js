Template.Upload.helpers({});
Template.Upload.events({
	"change .myFileInput": function(event, template) {
      FS.Utility.eachFile(event, function(file) {
        Pdf.insert(file, function (err, fileObj) {
          if (err){
             // handle error
          } else {
            Notify("Succesffully uploaded", "success");
          }
        });
     });
  }
});