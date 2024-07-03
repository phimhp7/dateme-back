const express = require("express");
const router = express.Router();
const Bracelets = require("./schema");
const jwt = require("jsonwebtoken");

// Fonction admin pour initialiser les bracelets

router.put("/init", async (req, res) => {
	const { id_first, id_md_first, nb_b } = req.body;
	console.log("init", id_first, id_md_first, nb_b);

	if (
		id_first === undefined ||
		id_md_first === undefined ||
		nb_b === undefined
	) {
		return res.status(400).send("Missing parameters in request body");
	}

	for (let i = 0; i < nb_b; i++) {
		const bracelet = new Bracelets({
			id: id_first + i,
			id_mdp: id_md_first + i,
			user_password: "",
			user_choice: "",
		});
		await bracelet.save();
	}
	res.send("Initialization complete");
});

// Fonction admin pour récupérer les bracelets

router.get("/getbracelets", async (req, res) => {
	Bracelets.find()
		.then((bracelets) => res.json(bracelets))
		.catch((err) => res.status(400).json("Error: " + err));
});

// Fonction admin pour supprimer les bracelets

router.delete("/deletebracelets", async (req, res) => {
	try {
		await Bracelets.deleteMany({});
		res.json({ message: "Bracelets deleted successfully." });
	} catch (err) {
		res.status(500).json({
			error: "An error occurred while deleting bracelets: " + err,
		});
	}
});

// Fonction admin pour supprimer un bracelet

router.delete("/deletebracelet/:id_bracelet", async (req, res) => {
	const { id_bracelet } = req.params;
	console.log("deletebracelet", id_bracelet);
	try {
		await Bracelets.findOneAndDelete({ id: id_bracelet });
		res.json({ message: "Bracelet deleted successfully." });
	} catch (err) {
		res.status(500).json({
			error: "An error occurred while deleting bracelet: " + err,
		});
	}
});

// Changement du mot de passe d'un bracelet

router.put("/updatepassword", async (req, res) => {
	const { id, id_pas, password } = req.body;
	try {
		const bracelet = await Bracelets.findOne({ id: id });
		if (!bracelet) {
			return res.status(404).json({ error: "Bracelet not found" });
		}
		if (bracelet.id_mdp !== id_pas) {
			return res.status(401).json({ error: "Invalid password" });
		}
		bracelet.user_password = password;
		await bracelet.save();
		const token = jwt.sign(
			{ user_password: bracelet.user_password },
			process.env.JWT_SECRET
		);
		res.json({ bracelet, token });
	} catch (err) {
		res.status(500).json({
			error: "An error occurred while updating password: " + err,
		});
	}
});

/*

router.get("/user/:username", async (req, res) => {
	const { username } = req.params;
	try {
		let user = await Scoring.findOne({ username: username });
		if (!user) {
			user = new Scoring({ username, score: 99999999 });
			await user.save();
		}
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
		res.json({ user, token });
	} catch (error) {
		res.status(500).json({
			error: "There was an error fetching/creating the user",
		});
	}
});

router.post("/newscore", async (req, res) => {
	const { username, score } = req.body;
	const scoring = new Scoring({
		username,
		score,
	});
	await scoring.save();
	res.send(scoring);
});

router.get("/getallscore", async (req, res) => {
	Scoring.find()
		.sort({ score: 1 })
		.limit(10)
		.then((scores) => res.json(scores))
		.catch((err) => res.status(400).json("Error: " + err));
});

router.delete("/clearscores", async (req, res) => {
	try {
		await Scoring.deleteMany({});
		res.json({ message: "Scores cleared successfully." });
	} catch (err) {
		res.status(500).json({
			error: "An error occurred while clearing scores: " + err,
		});
	}
});

router.post("/checktoken", async (req, res) => {
	const { token } = req.body;
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await Scoring.findById(decoded.userId);
		if (!user) {
			return res.status(401).json({ error: "Invalid token" });
		}
		res.json({ user });
	} catch (error) {
		res.status(401).json({ error: "Invalid token" });
	}
});

router.post("/updatescore", async (req, res) => {
	const { score, token } = req.body;
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await Scoring.findById(decoded.userId);
		if (!user) {
			return res.status(401).json({ error: "Invalid token" });
		}
		if (score < user.score && score > 45) {
			user.score = score;
			await user.save();
		}
		res.json({ user, score });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "There was an error updating the score",
		});
	}
});

router.delete("/deletescore/:id", async (req, res) => {
	try {
		await Scoring.findByIdAndDelete(req.params.id);
		res.json({ message: "Score deleted successfully." });
	} catch (err) {
		res.status(500).json({
			error: "An error occurred while deleting score: " + err,
		});
	}
});

router.get("/gettotalscore", async (req, res) => {
	try {
		const scores = await Scoring.find();
		let totalScore = 0;

		scores.forEach((score) => {
			totalScore += score.score;
		});

		res.json({ totalScore, scores });
	} catch (err) {
		res.status(500).json({
			error: "An error occurred while fetching total scores: " + err,
		});
	}
});
*/

module.exports = router;
