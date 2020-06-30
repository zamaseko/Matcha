const Q = require('./queryModel')
//const S = require('./securityModel')
/*
var local = function() {}

local.locate = () => {
	if(navigator.geolocation)
		console.log('true')
	else
		console.log('false')
}

local.locate()
*/

exports.create = (username, latitude, longitude, city, country, callback) => {
	var params = ['username', 'latitude', 'longitude', 'city', 'country']
	var vals = [username, latitude, longitude, city, country]
	Q.fetchone("geolocation", ['id'], 'username', username, (err, res) => {
		if (res && res.length > 0) {
			Q.update("geolocation", params, vals, 'username', username, (err, res) => {
				if (err) {
					console.log(err)
							callback(err, null)
				}
				else {
					let vals = [city, country]
					Q.update("profiles", ['city', 'country'], vals, 'username', username, (err, res) => {
						if (err) {
							console.log('location update : ', err)
							callback(err, null)
						} else {
							callback(null, "location updated")
						}
					})
				}
			})
		} else {
			Q.insert("geolocation", params, vals, (err, res) => {
		 		if (err)
					 console.log(err)
				else {
					let vals = [city, country]
					Q.update("profiles", ['city', 'country'], vals, 'username', username, (err, res) => {
						if (err) {
							callback(err, null)
						}
						else {
							callback(null, "location updated")
						}
					})
				}
		 	})
		}
	})
}
