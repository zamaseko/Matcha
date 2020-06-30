const bcrypt = require('bcrypt')
const crypto = require('crypto-js')

var Secure = function(){}

Secure.password = (pass, callback) => {
	var msg = "password must contain at least one "
	if (pass.length < 8)
		callback("password too short", null)
	else if (pass.search(/[0-9]/) < 0)
		callback(msg+"digit")
	else if (pass.search(/[A-Z]/) < 0)
		callback(msg+"uppercase character")
	else if (pass.search(/[a-z]/) < 0)
		callback(msg+"lowercase character")
	else if (pass.search(/[!@#$%^&*]/) < 0)
		callback(msg+"special character")
	else
		callback(null, "password is secure")
}

Secure.string = (field, str, callback) => {
	if (str.length < 3)
		callback(field+" too short")
	else if (!str.match(/^[a-zA-Z0-9_]+$/))
		callback(field+" may only contain alphabets, numbers & an underscore")
	else
		callback(null, "good "+field)
}

Secure.strage = (str, callback) => {
	if (str.length < 1 || str.length > 3 || !str.match(/^[0-9]+$/))
		callback("please enter a valid number", null)
	else if (parseInt(str) < 18)
		callback("you must be over 18 to create a profile", null)
	else if (parseInt(str) > 121)
		callback("how are you still alive?")
	else
		callback(null, str)
}

Secure.tags = (str, callback) => {
	var ar = str.split(',')
	var msg = null
	if (str.search(/[;]/) > 0)
		callback('no colons')
	for (let i in ar) {
		if (ar[i].length < 1 || ar[i].length > 12 || !ar[i].match(/^[a-z]+$/))
			msg = 'tags must be less than 12 lowercase alphabets each, separated by a single comma'
	}
	if (msg)
		callback(msg, null)
	else
		callback(null, ar)
}

Secure.radio = (param, radio, vals, callback) => {
	var found = null
	if (radio == null)
		callback(`please select a ${param}`)
	else {
		for (let i in vals) {
			if (radio.match(vals[i]))
				found = 1
		}
		if (found == 1)
			callback(null, radio)
		else
			callback('invalid option', null)
	}
}

Secure.locate = (str, callback) => {
	if (str.length < 3 || str.length > 12)
		callback("please enter valid location")
	else if (!str.match(/^[a-zA-Z-]+$/))
		callback("location may only contain alphabets & a dash")
	else
		callback(null, str)

}

Secure.bio = (str, callback) => {
	if (str.length < 10 || str.length > 200)
		callback("bio must be between 10 & 200 characters")
	else if (!str.match(/^[a-zA-Z0-9_]/))
		callback("bio may only contain alphabets, number & an underscore")
	else
		callback(null, str)
}

Secure.email = (addr, callback) => {
	var e = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
	if (!addr.match(e))
		callback("invalid email", null)
	else
		callback(null, "valid email")
}

Secure.createHash = (pass, callback) => {
	bcrypt.hash(pass, 10, (err, hash) => {
		if (err)
			callback(err)
		else
			callback(null, hash)
	})
}

Secure.findHash = (pass, hash, callback) => {
	bcrypt.compare(pass, hash, (err, res) => {
		if (res == true) 
			callback(null, "success")
		else 
			callback("wrong password", null)
	})
}

Secure.createToken = (pass, callback) => {
	var c = crypto.SHA256(pass+Date.now(), 'test').toString()
	callback(c)
}

module.exports = Secure
