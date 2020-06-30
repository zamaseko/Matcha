const Q = require('../models/queryModel')
const gum = require('../models/generateUsersModel')
const admod = require('../models/adminModel')

exports.auth = (req, res, next) => {
    var token = req.session.token
    var adminToken = req.session.adminToken
	if (!token)
		res.redirect('/login')
	else {
		Q.fetchone("tokens", ['username'], 'username', req.session.user, (err, result) => {
			if (result && result.length > 0) {
				Q.fetchone("users", ['admin'], 'username', req.session.user, (err, result) => {
					if (result && result.length > 0 && result[0].admin === 1) {
						next()
					} else
						res.redirect('/p')
				})
			}
			else
				res.redirect('/login')
		})
	}
}

exports.adminForm = (req, res) => {
	res.render('admin', {
		token: req.session.token,
		adminToken: req.session.adminToken,
		user: req.session.user
	})
}

exports.processForm = (req, res) => {
    let promise = new Promise ((resolve, reject) => {
        admod.parseForm(req.body, (error, resolution) => {
            if (error) {
                console.log(error)
                res.redirect('/')
            }
            else {
                res.redirect('/')
                resolve(resolution)
            }
        })
    })
    promise.then( count => {
        let accounts = new Promise ((resolve, reject) => {
            gum.initTestAccounts(req.session.user, count, (err, result) => {
                if (err) {
                    console.log(err)
                }
                else {
                    resolve(result)
                }
            })
        })
        accounts.then(result => {
            console.log(result)
            //res.redirect('/')
        }).catch( err => {
            console.log(err.message)
            //res.redirect('/')
        })
    }).catch( err => {
        console.log(err.message)
        //res.redirect('/')
    })
    //res.redirect('/')
}
