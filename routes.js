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
			matches: [],
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

// Changement du mot de passe d'un bracelet (register)

router.put("/updatepassword", async (req, res) => {
	const { id, id_pas, password, choice } = req.body;
	try {
		const bracelet = await Bracelets.findOne({ id: id });
		if (!bracelet) {
			return res.status(404).json({ error: "Bracelet not found" });
		}
		if (bracelet.id_mdp !== id_pas) {
			return res.status(401).json({ error: "Invalid password" });
		}
		if (bracelet.user_password !== "") {
			return res.status(400).json({
				error: "Bracelet already registered",
			});
		}
		bracelet.user_password = password;
		bracelet.user_choice = choice;
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

// fontion login pour un bracelet

router.post("/login", async (req, res) => {
	const { id, password } = req.body;
	try {
		const bracelet = await Bracelets.findOne({ id: id });
		if (!bracelet) {
			return res.status(404).json({ error: "Bracelet not found" });
		}
		if (bracelet.user_password !== password) {
			return res.status(401).json({ error: "Invalid password" });
		}
		const token = jwt.sign(
			{ user_password: bracelet.user_password },
			process.env.JWT_SECRET
		);
		res.json({ bracelet, token });
	} catch (err) {
		res.status(500).json({
			error: "An error occurred while logging in: " + err,
		});
	}
});

// Fonction pour envoyer un message

router.put("/sendmessage/:id", async (req, res) => {
	const { id } = req.params;
	const { message, numero_client, token } = req.body;
	try {
		// Verify the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Find the bracelets
		const bracelet = await Bracelets.findOne({ id: numero_client });
		const bracelet_crush = await Bracelets.findOne({ id: id });

		// Check if bracelets exist and if the crush bracelet has a user password
		if (
			!bracelet ||
			!bracelet_crush ||
			bracelet_crush.user_password === "" ||
			id === numero_client
		) {
			return res.status(404).json({ error: "Bracelet not found" });
		}

		// Verify the user password from the token
		if (bracelet.user_password !== decoded.user_password) {
			return res.status(401).json({ error: "Invalid token" });
		}

		// Check if a message has already been sent to the crush bracelet
		if (bracelet.DM_sent.some((DM) => DM.id === bracelet_crush.id)) {
			return res
				.status(400)
				.json({ error: "Message already sent to this bracelet" });
		}

		// Check if there is a mutual match
		const isMutualMatch =
			bracelet_crush.matches.some((match) => match.id === bracelet.id) &&
			bracelet.matches.some((match) => match.id === bracelet_crush.id);

		if (isMutualMatch) {
			// Update matches if mutual match exists
			bracelet.matches.forEach((match) => {
				if (match.id === bracelet_crush.id) {
					match.matched = true;
				}
			});

			bracelet_crush.matches.forEach((match) => {
				if (match.id === bracelet.id) {
					match.message = message;
					match.matched = true;
				}
			});
		} else {
			// Add new match entries if no mutual match
			bracelet_crush.matches.push({
				id: bracelet.id,
				message: message,
				matched: false,
				options: bracelet.user_choice,
			});

			bracelet.matches.push({
				id: bracelet_crush.id,
				matched: false,
				options: bracelet_crush.user_choice,
			});

			// Record the DM sent
			bracelet.DM_sent.push({ id: bracelet_crush.id });
		}

		// Save the updated bracelets
		await bracelet.save();
		await bracelet_crush.save();

		// Send success response
		res.status(200).json({
			success: true,
			message: "Message sent successfully",
		});
	} catch (err) {
		res.status(500).json({
			error: "An error occurred while sending message: " + err,
		});
	}
});

// Fonction pour récupérer les matchs

router.get("/getmatches/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const bracelet = await Bracelets.findOne({ id: id });
		if (!bracelet) {
			return res.status(404).json({ error: "Bracelet not found" });
		}
		const matches = bracelet.matches.filter(
			(match) => match.matched === true
		);
		res.json({ matches });
	} catch (err) {
		res.status(500).json({
			error: "An error occurred while fetching matches: " + err,
		});
	}
});

// Fonction pour effacer tout les matchs

router.delete("/deletematches/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const bracelet = await Bracelets.findOne({ id: id });
		if (!bracelet) {
			return res.status(404).json({ error: "Bracelet not found" });
		}
		bracelet.matches = [];
		bracelet.DM_sent = [];
		await bracelet.save();
		res.json({ message: "Matches deleted successfully" });
	} catch (err) {
		res.status(500).json({
			error: "An error occurred while deleting matches: " + err,
		});
	}
});

// Fonction pour effacer les matchs de tous les bracelets

router.delete("/deletematches", async (req, res) => {
	try {
		const bracelets = await Bracelets.find();
		bracelets.forEach(async (bracelet) => {
			bracelet.matches = [];
			bracelet.DM_sent = [];
			await bracelet.save();
		});
		res.json({ message: "Matches deleted successfully" });
	} catch (err) {
		res.status(500).json({
			error: "An error occurred while deleting matches: " + err,
		});
	}
});

module.exports = router;
