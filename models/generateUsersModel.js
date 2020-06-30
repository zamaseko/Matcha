const Q = require('./queryModel')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')
const kg = require('./keyGeneratorModel')
const admod = require('./adminModel')

exports.initAdmin = (username, callback) => {
    let promise = new Promise((res, rej) => { 
        bcrypt.genSalt(10, function(err, salt) {
            kg.genPass((err, passkey) => {
                if (err)
                    rej(err)
                console.log(`passkey : ${passkey}`)
                bcrypt.hash(passkey, salt, function(err, hash) {
                    if (err)
                        throw(err)
                    else if (hash){
                        res(hash)
                    }
                })
            })
        })
    }) 
    promise.then( hash => {
        const tempPath = path.join(__dirname, '../config/temp')
        if (!fs.existsSync(tempPath)) {
            fs.mkdirSync(tempPath)
        }
        fs.writeFile(`${tempPath}/${username}.txt`, `${hash}`, (err) => {
            if (err)
                throw (err)
        })
        callback(`${username} enter passkey to verify admin status`)
    }).catch(err => rej(err.message))
}

exports.verifyAdmin = (username, passkey, callback) => {
    const filePath = path.join(__dirname, `../config/temp/${username}.txt`)
    let promise = new Promise ((res, rej) => {
        fs.readFile(filePath, 'utf8', (err, contents) => {
            if (err)
                throw(err)
            else {
                res(contents)
            }
        })
    })
    promise.then(contents => {
        bcrypt.compare(passkey, contents, (err, match) => {
            if (err)
                throw(err)
            else if (match) {
                params = ['admin']
                val = 1
                Q.update("users", params, val, "username", username, (err, res) => {
                    if (err)
                        throw(err)
                    else {
                        callback(null, `${username} is now an admin`)
                    }
                })
            }
            else {
                callback("passkey authentication failed", null)
            }
        })
    }).catch(err => callback(err, null)) 
}

exports.initTestAccounts = (adminName, count, callback) => {
    let verify = new Promise ((resolve, reject) => {
        Q.fetchone("users", ['admin'], 'username', adminName, (err, res) => {
            if (err) {
                callback(err, null)
            }
            else {
                resolve(res)
            }
        })
    })
    verify.then(res => {
        if (res && res[0].admin) {
            let promise = new Promise ((res, rej) => {
                var i
                for (i = 0; i < count; i++) {
                    setTimeout((i) => {
                        admod.genUser((fail, succeed)  => {
                            if (fail) { rej(fail) }
                            else {
                                console.log(`new user [${i + 1}]: ${succeed.username}  password : ${succeed.unhash} created`)
                                //res(i)
                                if (i == count - 1) {
                                    setTimeout(() =>{
                                        res(count)
                                    }, 10)
                                }
                            }
                        })
                    }, (i + 1) * 50, i)
                }
            })
            promise.then(count => { 
                callback(null, `${count} test-accounts created successfully`) 
            }).catch(err => callback(err, null))
        }
        else {
            callback(null, `${adminName} is not an admin`)
        }
    }).catch(err => callback(err, null))
}

exports.sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}