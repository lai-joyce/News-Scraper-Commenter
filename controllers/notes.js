var Note = require("../models/Comment");

module.exports = {
	get: function(data, cb) {
		Note.find({
			_articleId: data._id
		}, cb);
	},
	save: function(data, cb) {
		var newNote = {
			_headlineId: data.articleId,
			// date: makeDate(),
			noteText: data.commentText
		};

		Note.create(newNote, function(err, doc) {
			if (err) {
				console.log(err);
			}
			else {
				console.log(doc);
				cb(doc);
			}
		});
	},
	delete: function(data, cb) {
		Note.remove({
			_id: data.articleId
		}, cb);
	}
};