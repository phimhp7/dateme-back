require("dotenv").config();
const https = require("https");
const http = require("http");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Routes = require("./routes");

const app = express();

https
	.createServer(
		{
			key: fs.readFileSync("./key.key"),
			cert: fs.readFileSync("./sslcert.pem"),
		},
		app
	)
	.listen(3001, () => console.log("Listening on port 3001"));

mongoose
	.connect(
		"mongodb://cly511mgy0dhta1o229lk53zx:mCpP3VRGtwl3Pe5191jtDAF0@51.77.215.183:9000/?readPreference=primary&ssl=false",
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
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
