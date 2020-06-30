const insertController = require('../controllers/queryController');

exports.appRoute = router => {
	router.get("/insert", queryController.insertController);
}
