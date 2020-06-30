const Q = require('./queryModel')
const S = require('./securityModel')
const E = require('./emailModel')

var User = function(user) {
	this.username = user.username
	this.first_name = user.first_name
	this.last_name = user.last_name
	this.email = user.email
	this.password = user.password
}

User.validate = (user, callback) => {
	var e = {username: null, first_name: null, last_name: null, email: null, password: null}
	var result = {username: null, first_name: null, last_name: null, email: null, password: null}
	S.string("username", user.username, (err, res) => {
		e.username = err
		result.username = res})
	S.string("first_name", user.first_name, (err, res) => {
		e.first_name = err
		result.first_name = res})
	S.string("last_name", user.last_name, (err, res) => {
		e.last_name = err
		result.last_name = res})
	S.email(user.email, (err, res) => {
		e.email = err
		result.email = res})
	S.password(user.password, (err, res) => {
		e.password = err
		result.password = res})
	if (e.username || e.first_name || e.last_name || e.email || e.password)
		callback(e, result)
	else
		callback(null, result)
}

User.check = (user, callback) => {
	var e = {username: null, email: null}
	var msg = 'not available'
	Q.fetchone("users", 'username', 'username', user.username, (err, res) => {
		if (res && res.length > 0)
			callback('(username not available)')
		else {
			Q.fetchone("users", 'email', 'email', user.email, (err, res) => {
				if (res && res.length > 0)
					callback('(email not available)')
				else
					callback(null, 'success')
			})
		}
	})
}

User.create = (user, callback) => {
	S.createHash(user.password, (err, hash) => {
		if (err)
			callback(err)
		else {
			S.createToken(hash, (token) => {
				var link = `<p>welcome to matcha ${user.username}</p><br><a href='http://localhost:5000/v/${token}'>`+
				`click here to complete registration</a>`
				E.sendMail({from: 'matcha@matcha.com', to: user.email, subject: 'verification', text: link}, (err, info) => {
					if (err)
						callback('signup failed (email verification error)'+err)
					else {
						Q.insert("users", ['username', 'first_name', 'last_name', 'email', 'password'], [user.username, user.first_name, user.last_name, user.email, hash], (err, res) => {
							if (err)
								callback(err, null)
							else {
								Q.insert("tokens", ['username', 'type', 'token'], [user.username, 'signup', token], (err, success) => {
									if (err)
										callback(err, null)
									else {
										callback(null, info)
									}
								})
							}
						})
					}
				})
			})
		}
	})
}

User.login = (user, callback) => {
	let promise = new Promise ((resolve, reject) => {
		Q.fetchone("users", ['id', 'username', 'password', 'verified'], 'username', user.username, (err, res) => {
			if (res && res.length > 0) {
				resolve(res)
			}
			else 
				callback("username or password incorrect", null)
		})
	})
	promise.then(res => {
		if (res[0].verified > 0) {
			S.findHash(user.password, res[0].password, (err, result) => {
				if (err)
					callback("username or password incorrect", null)
				else {
					S.createToken(res[0].password, (token) => {
						let insure = new Promise ((y, n) => {
							Q.insert("tokens", ['username', 'type', 'token'], [user.username, 'login', token], (err, success) => {
								if (err)
									callback(err, null)
								else
									y(token)
							})
						})
						insure.then(token => {
							callback(null, token)
						})
					})
				}
			})
		} 
		else
			callback("please verify account")
	}).catch(err => { console.log(err.message) })
}

User.verify = (token, callback) => {
	Q.fetchone("tokens", ['username', 'token'], 'token', token, (err, res) => {
		if (res.length > 0) {
			Q.update("users", ['verified'], 1, 'username', res[0].username, (er, result) => {
				if (err)
					callback(err, null)
				else {
					Q.delone("tokens", 'token', token, (err, results) => {
						if (err)
							callback(err, null)
						else
							callback(null, results)
					})
				}
			})
		}
		else {
			callback("wrong token", null)
		}
	})
}

module.exports = User
