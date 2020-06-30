'use strict';

const DB = require('./db.model');
const dbc = require('./conn.model');

const newDB = new DB();
DB.init();

var insert = function (t_name, params, values) {
		var v = '';
		for (let p in params)
			v += '?, ';
		v = v.slice(0, -2);
		var sql = "INSERT INTO " + t_name + " (" + params.join() + ") " +
				"VALUES " + "(" + v + ")";
		DB.insert(sql, values);
	}

insert("users", ['username', 'email', 'password'], ['janet', 'janet@mail', 'jackson']);
