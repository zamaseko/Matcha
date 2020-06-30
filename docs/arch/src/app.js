const express = require('express');
const app = express();

const port = 3000;

const path = require('path');
const bodyParser = require('body-parser');
const bootstrap = require('./src/bootstrap');

app.set("view enging", "pug");
app.set("views", path.resolve("./src/views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const router = express.Router();
app.use(router);

const rootPath = path.resolve("./dist");
app.use(express.static(rootPath));

bootstrap(app, router);

router.get("/", (req, res, next) => {
	return res.send("home");
});

router.use((err, req, res, next) => {
	if (err) {
		return res.send(err.message);
	}
});

app.listen(port, err => {
	if (err) return console.log(`cannot listen on port ${port}`);
	console.log(`server listening on port ${port}`);
});
