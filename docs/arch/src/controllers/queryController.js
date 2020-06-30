const post = require("../models/queryModel");

exports.insertController = (req, res, next) => {
	const query = post.q_insert();

	res.render("ans", { query });
};
