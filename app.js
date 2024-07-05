require("dotenv").config();
const https = require("https");
const http = require("http");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Routes = require("./routes");

const app = express();

/*
https
	.createServer(
		{
			key: fs.readFileSync("./privkey2.pem"),
			cert: fs.readFileSync("./cert.pem"),
		},
		app
	)
	.listen(3001, () => console.log("Listening on port 3001"));
*/

http.createServer(app).listen(3001, () =>
	console.log("Listening on port 3001")
);

mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.log("Failed to connect to MongoDB", err));

app.use(
	cors({
		origin: "*",
	})
);
app.use(express.json());
app.use("/", Routes);

app.use((req, res, next) => {
	res.status(404).send("Not Found");
});
