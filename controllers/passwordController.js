const Q = require('../models/queryModel')
const pass = require('../models/passwordModel')

exports.forgotPassword = (req, res) => {
	const newUser = new pass(req.body)
	pass.link(newUser, (err, result) => {
		if (err) {
			console.log(err)
		}
		else {
			console.log(result)
			res.redirect('/login')
		}
	})
}

exports.forgotDisplay = (req, res) => {
	res.render('forgotpassword')
}

exports.resetForm = (req, res) => {
  	var token = req.params.token
	Q.fetchone("tokens", ['username', 'token'], 'token', token, (err, result) => {
		if (result.length > 0) {
			res.render('resetpassword', {token: token})
		}
		else
			res.redirect('/')
	})
}

exports.resetPassword = (req, res) => {
	var token = req.params.token
	Q.fetchone("tokens", ['username', 'token'], 'token', token, (err, result) => {
		if (result.length > 0) {
			var password = req.body.password
			pass.reset(result[0].username, password, token, (err, result) => {
				if (err)
					console.log(err)
				else {
					console.log("password reset successful")
					res.redirect('/login')
				}
			})
		}
		else {
			console.log("invalid token")
			res.redirect('/')
		}
	})
}
