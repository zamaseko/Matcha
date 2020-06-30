'use strict'

const mysql = require('mysql')
const config = require('../config/config')

const dbc = mysql.createConnection(config.logins, config.db)
dbc.connect((err) => {
	if (err) throw err
})

module.exports = dbc
