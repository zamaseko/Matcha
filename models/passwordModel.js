const Q = require('./queryModel')
const S = require('./securityModel')
const E = require('./emailModel')

var Password = function(user) {
	this.username = user.username
	this.password = user.password
}

Password.link = (user, callback) => {
	Q.fetchone("users", ['email'], 'username', user.username, (err, res) => {
		if (res.length > 0) {
			S.createToken(res[0].email, (token) => {
				var link = `<p>welcome to matcha ${user.username}</p><br>`+
				`<a href='http://localhost:5000/f/${token}'>`+
				`click here to reset password</a>`
				E.sendMail({from: 'matcha@matcha', to: res[0].email, subject: 'reset password', text: link}, (err, info) => {
					if (err)
						callback("(email error) please try again after 5 seconds", null)
					else {
						Q.insert("tokens", ['username', 'type', 'token'], [user.username, 'reset', token], (err, success) => {
						if (err)
							callback(err)
						else
							callback(null, "please check your email for reset link")
						})
					}
				})
			})
		}
		else
			callback("please enter correct username", null)
	})
}

Password.reset = (username, password, token, callback) => {
	S.password(password, (err, res) => {
		if (err)
			callback(err, null)
		else {
			S.createHash(password, (err, hash) => {
				if (err)
					callback(err, null)
				else {
					Q.update("users", ['password'], hash, 'username', username, (err, result) => {
						if (err)
							callback(err, null)
						else {
							Q.delone("tokens", 'token', token, (err, success) => {
								if (err)
									callback(err, null)
								else
									callback(null, success)
							})
						}
					})
				}
			})
		}
	})
}

module.exports = Password
