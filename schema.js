const { default: mongoose } = require("mongoose");
const { format } = require("morgan");

const BraceletsData = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
	},
	id_mdp: {
		type: String,
		required: true,
	},
	user_password: {
		type: String,
		required: false,
	},
	user_choice: {
		type: String,
		required: false,
	},
});

const Bracelets = mongoose.model("Bracelets", BraceletsData);

module.exports = Bracelets;
