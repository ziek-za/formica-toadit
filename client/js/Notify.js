GLOBAL_NOTIFY = "ASJDKH193";

Notify = function(msg, result) {
	// result: success, fail, warning
	var msgs = Session.get(GLOBAL_NOTIFY);
	if (_.isUndefined(msgs)) {
		msgs = [];
	}
	var _id = GenerateRandomId(6);
	msg = {
		'msg': msg,
		'status': result,
		'_id': _id
	};
	msgs.unshift(msg);
	removeMsg(_id);
	Session.set(GLOBAL_NOTIFY, msgs);
};
// GLOBAL FUNCTION
RemoveNotification = function(_id) {
	var msgs = Session.get(GLOBAL_NOTIFY);
    var index = -1;
    for (i = 0; i < msgs.length; i++) {
        if (_id === msgs[i]._id) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        msgs.splice(index, 1);
    }
    Session.set(GLOBAL_NOTIFY, msgs);
};
// LOCAL FUNCTION
var removeMsg = function(_id) {
	setTimeout(function() {
		RemoveNotification(_id)
	}, 8000);
};