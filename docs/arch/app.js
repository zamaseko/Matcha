var express = require('express');
var app = express();


//set up view engine
app.set('view engine', 'ejs');

//import routes/index.js
var index = require('./routes/index');

//body parser read HTTP POST data from form & stores as js object
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', index);

app.listen(4000, () => {
	console.log('listening at port 4000...');
});
