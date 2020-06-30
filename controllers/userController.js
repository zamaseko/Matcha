const Q = require('../models/queryModel')
const User = require('../models/userModel')
const pass = require('../models/passwordModel')
const gen = require('../models/generateUsersModel')
const admin = require('../models/adminModel')
const key = require('../models/keyGeneratorModel')

exports.auth = (req, res, next) => {
	var token = req.session.token
	var adminToken = req.session.adminToken
	if (!token)
		res.redirect('/login')
	else {
		Q.fetchone("tokens", ['token'], 'token', token, (err, result) => {
			if (err)
				res.redirect('/login')
			else if (result.length > 0) {
				next()
			}
			else
				res.redirect('/login')
		})
	}
}

exports.loginForm = (req, res) => {
	if (req.session.token)
		res.redirect('/logout')
	else
		res.render('login')
}

exports.list_users = (req, res) => {
	var token = req.session.token
	var adminToken = req.session.adminToken
	var pars = {token: token, adminToken: adminToken, user: req.session.user, suggestions: null}
	let filter = new Promise ((y, n) => {
		Q.fetchall("profiles", (err, data) => {
			if (err) {
				console.log(err)
			}
			else if (data) 
				y(data)
		})
	})
	filter.then(data => {
		if (data.length > 0) {
			let distcalc = new Promise((resolve, reject) => {
				key.calculateDistance(req.session.user, data, (err, result) => {
					if (err) {
						console.log(err)
						res.render('index', pars)
					}
					else if (result) {
						resolve(result)
					}
				})
			})
			distcalc.then(outcome => {
				let listDistances = new Promise ((resolve, reject) => {
					Q.fetchall(req.session.user, (err, rows) => {
						if (err) {
							console.log(err)
							res.render('index', pars)
						}
						else if (rows) {
							pars.suggestions = rows
							resolve(rows)
						}
					})
				})
				listDistances.then(rows => {
					if (rows.length > 0) {
						Q.countRows(req.session.user, (err, result) => {
							if (err) {
								console.log(err)
							}
							else {
							}
						})
					}
				})
			}).catch(err => {
				throw(err)
			})
		}
		else {
			res.render('index', pars)
		}
		Q.tableExists(req.session.user, (err, result) => {
			if (err) {
				console.log("tableExists error : ", err)
			}
			else if (result === 1){
				let cached = new Promise((resolve, reject) => {
					let orderCol = 'distance, sharedInterestsCount DESC, popularity DESC'
					Q.fetchallOB(req.session.user, orderCol, (error, rows) => {
						if (error) {
							console.log(error)
							res.render('index', pars)
						}
						else if (rows) {
							pars.suggestions = rows
							resolve(rows)
						}
					})
				})
				cached.then(rows => {
					res.render('index', pars)
				}).catch(err => {console.log(err)})
			}
			else {
				res.render('index', pars)
			}
		})
		
	})
}

exports.formSignup = (req, res) => {
	if (req.session.token)
		res.redirect('/logout')
	else
		res.render('signup')
}

exports.registerUser = (req, res) => {
	const newUser = new User(req.body)
	User.validate(newUser, (err, result) => {
		if (err) {
			console.log("registration failed", err)
			res.redirect('/signup')
		}
		else {
			User.check(newUser, (err, result) => {
				if (err) {
					console.log("registration failed", err)
					res.redirect('/signup')
				}
				else {
					User.create(newUser, (err, result) => {
						if (err)
							console.log(err)
						else {
							console.log("registration successful")
							res.redirect('/')
						}
					})
				}
			})
		}
	})
}

exports.loginUser = (req, res) => {
	const newUser = new User(req.body)
	/* admin navbar link */
	let promise = new Promise ((resolve, reject) => {
		User.login(newUser, (err, result) => {
			if (err) {
				reject(err)
			}
			else {
				req.session.token = result
				req.session.user = newUser.username
				resolve(req.session.user)
			}
		})
	})	
	promise.then(user => {
		let vetted = new Promise ((y, n) => {
			admin.isAdmin(user, (fail, win) => {
					if (fail) {
						throw(fail)
					}
					else {
						req.session.adminToken = win
						y(req.session.adminToken)
					}
			})
		})
		vetted.then ((status) => {
			let admin = (status === 1) ? "[admin]" : "[non-admin]"
			console.log("login successful ", admin)
			res.redirect('/')
		}).catch(err => { throw(err)})
	}).catch(err => { 
		console.log(err)
		res.redirect('/login')
	})
	/* eoc */
}

exports.logoutUser = (req, res) => {
	Q.delone("tokens", 'token', req.session.token, (err, result) => {
		if (err)
			console.log(err)
		else {
			console.log(`${req.session.user} logged out`)
			req.session.reset()
			res.redirect('/')
		}
	})
}

exports.verifyUser = (req, res) => {
	var token = req.params.token
	User.verify(token, (err, result) => {
		if (err) {
			console.log("verification failed")
			res.redirect('/signup')
		}
		else {
			console.log("user verified")
			res.redirect('/login')
		}
	})
}

exports.createAdmin = (req, res) => {
	gen.initAdmin(req.session.user, (result) => {
			res.send(result)
	})
}

exports.vAdmin =(req, res) => {
	gen.verifyAdmin(req.session.user, req.body.key, (err, result) => {
		if (err) {
			console.log(err)
			res.redirect('/p')
		}
		else {
			let promise = new Promise((resolve, reject) => {
				key.genPlaces(25, (error, success) => {
					if (error) {
						reject(error)
					}
					else {
						console.log(result)
						req.session.adminToken = 1
						resolve(success)
					}
				})
			})
			promise.then(places => {
				console.log(places)
				res.redirect('../admin')
			}).catch(err => { console.log(err) })
			//res.send(result)
		}
	})
}
