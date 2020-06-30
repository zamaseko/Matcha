const Q = require('./queryModel')
var Mutex = require('async-mutex').Mutex
var Semaphore = require('async-mutex').Semaphore
var withTimeout = require('async-mutex').withTimeout

var Browse = function(){}
/*
Browse.like = (user, liked, callback) => {
	var par = ['username', 'liked']
	Q.fetchone("likes", par, 'liked', liked, (err, res) => {
		if (res && res.length > 0) {
			Q.delone("likes", 'liked', liked, (err, result) => {
				if (err)
					callback(err, null)
				else
					callback(null, `${user} unliked ${liked}`)
			})
		} else {
			Q.insert("likes", par, [user, liked], (err, result) => {
				if (err)
					callback(err, null)
				else
					callback(null, `${user} liked ${liked}`)
			})
		}
	})
}
*/
Browse.popularity = (match, callback) => {
	Q.fetchone("visits", ['visited'], 'visited', match, (err, a) => {
  		if (err)
  			callback(err)
		else if (a.length > 0) {
			var pop = 0
			Q.fetchone("likes", ['liked'], 'liked', match, (err, b) => {
				if (err)
					callback(err)
				else if (b && b.length > 0) 
					pop = (b.length/a.length)*10
				Q.update("profiles", ['popularity'], pop, 'username', match, (err, res) => {
					if (err)
						callback(err)
					else
						callback(null, `${pop}/10 rating`)
				})
			})
		}
	})
}

Browse.visit = (user, match, callback) => {
	var par = ['visitor', 'visited', 'year', 'month']
	var msg = `${user} visited ${match}`
	var t = new Date()
	Q.fetchoneMRows("visits", ['visited'], ['visitor', 'visited', 'month'], [user, match, t.getMonth()], (err, data) => {
		if (data && data.length > 0) {
				callback(null, `${msg} again`)
		} else {
			Q.insert("visits", par, [user, match, t.getFullYear(), t.getMonth()], (err, result) => {
				if (err)
					callback(err)
				else {
					Browse.popularity(match, (err, res) => {
						if (err)
							callback(err)
						else
							callback(null, `${msg} (${res})`)
					})
				}
			})
		}
	})
}

Browse.suspend = (user, admin, callback) => {
	var params = ['suspended']
	let promise = new Promise ((resolve, reject) => {
		Q.fetchone("profiles", params, 'username', user, (err, res) =>{
			if (res && res.length > 0) {
				var val = (res[0].suspended) ? 0 : 1
				resolve(val)
			} else {
				callback(JSON.stringify({error: `user ${user} not found`}), null)
			}
		})
	})
	promise.then(val => {
		Q.update("profiles", params, val, 'username', user, (err,res) => {
			if (err) {
				console.log(err)
				callback(JSON.stringify({error: err}), null)
			}
			else if (val === 1) {
				console.log(`${admin} suspended ${user}`)
				callback(null, JSON.stringify({label:"suspension status", value:"1", initiator:admin, user:user}))
			}
			else {
				console.log(`${admin} unsuspended ${user}`)
				callback(null, JSON.stringify({label:"suspension status", value:"0", initiator:admin, user:user}))
			}
		})
	}).catch(err => { 
		console.log(err.message) 
		callback(JSON.stringify({error: err}), null)
	})
}

Browse.block = (user, blocker, callback) => {
	var params = ['username', 'blocker']
	var pvals = [user, blocker]
	Q.fetchoneMRows("blocked", ['id'], params, pvals, (err, res) => {
		if (res && res.length > 0) {
			Q.deloneMRows("blocked", params, pvals, (err, res)=> {
				if (err) {
					console.log(err)
					callback(JSON.stringify({error: err}), null)
				}
				else {
					console.log(`${blocker} unblocked ${user}`)
					callback(null, JSON.stringify({ label:"blocked status", value:"0", initiator:blocker, user:user }))
				}
			})
		}
		else
			Q.insert("blocked", params, pvals, (err, res) => {
				if (err) {
					console.log(err)
					callback(JSON.stringify({error: err}), null)
				}
				else {
					console.log(`${blocker} blocked ${user}`)
					callback(null, JSON.stringify({ label:"blocked status", value:"1", initiator:blocker, user:user }))
				}
			})
	})
}

Browse.checkstat = (user, other, table, params, callback) => {
	var pvals = [user, other]
	Q.fetchoneMRows(table, ['id'], params, pvals, (err, res) => {
		if (err) {
			callback(JSON.stringify({error: err}), null)
		}
		else if (res && res.length > 0) {
			callback(null, JSON.stringify({status: "1"}))
		}
		else {
			callback(null, JSON.stringify({status: "0"}))
		}
	})
}

Browse.likeTweaked = (user, liked, callback) => {
	var params = ['username', 'liked']
	var pvals = [user, liked]
	Q.fetchoneMRows("likes", ['id'], params, pvals, (err, res) => {
		if (res && res.length > 0) {
			Q.deloneMRows("likes", params, pvals, (err, result) => {
				if (err)
					callback(JSON.stringify({error: err}), null)
				else { 
					console.log(`${user} unliked ${liked}`)
					Browse.popularity(liked, (err, res) => {
						if (err)
							callback(err)
						console.log(res)
					})
					callback(null, JSON.stringify({ label:"like status", value:"0", initiator:user, user:liked }))
				}
			})
		} else {
			Q.insert("likes", params, pvals, (err, result) => {
				if (err) {
					callback(JSON.stringify({error: err}), null)
				}
				else {
					console.log(`${user} liked ${liked}`)
					Browse.popularity(liked, (err, res) => {
						if (err)
							callback(err)
						console.log(res)
					})
					callback(null, JSON.stringify({ label:"like status", value:"1", initiator:user, user:liked }))
				}
			})
		}
	})
}

Browse.checkMatch = (user, liked, callback) => {
	var params = ['username', 'liked']
	var pvals = [liked, user]
	Q.fetchoneMRows("likes", ['liked', 'lovers'], params, pvals, (err, res) => {
		 if (res && res.length > 0) {
		 	if (res[0].lovers == 1) {
				Q.updateMRows("likes", ['lovers'], 0, params, [user, liked], (err, res) => {
					if (err)
						callback(err)
					else {
						Q.updateMRows("likes", ['lovers'],0, params, pvals, (err, res) => {
							if (err)
								callback(err)
							else
								callback(null, `${user} & ${liked} are not a match :(`)
						})
					}
				})
			} else {
				Q.updateMRows("likes", ['lovers'], 1, params, pvals, (err, success) => {
					if (err)
						callback(err+" mxm", null)
					else {
						Q.updateMRows("likes", ['lovers'], 1, params, [user, liked], (err, success) => {
							callback(null, `${user} & ${liked} like each other!`)
						})
					}
				})
			}
		}
	})
}

module.exports = Browse
