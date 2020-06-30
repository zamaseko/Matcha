'use strict';

var sessionData = {
	resave: false,
	saveUninitialized: false,
	secret: 'matchbox',
}

var sessionConfig = {
	cookieName: 'session',
	secret: 'random_string',
	duration: 60 * 60 * 60 * 1000,
	activeDuration: 60 * 60 * 1000
}

module.exports = sessionConfig
