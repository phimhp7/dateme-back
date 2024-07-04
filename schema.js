const { default: mongoose } = require("mongoose");
const { format } = require("morgan");

const MatchSchema = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
	},
	options: {
		type: String,
		required: false,
	},
	message: {
		type: String,
		required: false,
	},
	matched: {
		type: Boolean,
	},
});

const DMSentSchema = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
	},
});

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
	matches: {
		type: [MatchSchema],
		required: false,
	},
	DM_sent: {
		type: [DMSentSchema],
		required: false,
	},
});

const Bracelets = mongoose.model("Bracelets", BraceletsData);

module.exports = Bracelets;
