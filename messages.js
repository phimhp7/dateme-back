const { default: mongoose } = require("mongoose");
const { format } = require("morgan");

const messageData = new mongoose.Schema({
	id_first: {
		type: Number,
		required: true,
	},
	id_second: {
		type: Number,
		required: true,
	},
	message_1: {
		type: String,
		required: true,
	},
	message_2: {
		type: String,
		required: true,
	},
});

const Bracelets = mongoose.model("Bracelets", BraceletsData);

module.exports = Bracelets;
