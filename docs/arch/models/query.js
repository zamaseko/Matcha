'use strict';

const DB = require('./db.model');

class query {
	constructor() {
		this.db = null;
		this.connect();
	}

	connect () {
		var dx = new DB();
		var d = dx.init_db();
		console.log(d);
	}

	insert (t_name, params, values) {
		var v = '';
		for (let p in params)
			v += '?, ';
		v = v.slice(0, -2);
		var sql = "INSERT INTO " + t_name + " (" + params.join() + ") " +
				"VALUES " + "(" + v + ")";
		if (this.db.init_db())
		{
			this.db.insert(sql, values);
			console.log ("inserted into user");
		}
		else
			this.db.init_db();
	}
}

var q = new query();
//q.insert("users", ['username', 'email', 'password'], ['janet', 'janet@mail', 'jackson']);

