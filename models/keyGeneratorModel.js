var generateKey = require("password-generator")
var generateUsername = require ("random-username-generator")
var generateEmail = require ("random-email")
var generateSentence = require ("random-sentence")
var Chance = require ("chance")
var randomLocation = require ("random-location")
var https = require ("https")
var Q = require ("./queryModel")
var Geo = require ("./geoModel")
var conn = require ("./connModel")
//const { resolve } = require("path")
var B = require ("./browseModel")



exports.genPass = (callback) => {   
    var maxLength = 18
    var minLength = 12
    var uppercaseMinCount = 3
    var lowercaseMinCount = 3
    var numberMinCount = 2
    var specialMinCount = 2
    var UPPERCASE_RE = /([A-Z])/g
    var LOWERCASE_RE = /([a-z])/g
    var NUMBER_RE = /([\d])/g
    var SPECIAL_CHAR_RE = /([\?\-])/g
    var NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g
    
    function isStrongEnough(password) {
        var uc = password.match(UPPERCASE_RE)
        var lc = password.match(LOWERCASE_RE)
        var n = password.match(NUMBER_RE)
        var sc = password.match(SPECIAL_CHAR_RE)
        var nr = password.match(NON_REPEATING_CHAR_RE)
        return password.length >= minLength &&
            !nr &&
            uc && uc.length >= uppercaseMinCount &&
            lc && lc.length >= lowercaseMinCount &&
            n && n.length >= numberMinCount &&
            sc && sc.length >= specialMinCount
    }
    
    function customPassword() {
        var password = "";
        var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength
        while (!isStrongEnough(password)) {
            password = generateKey(randomLength, false, /[\w\d\?\-]/)
        }
        callback(null, password)
    }
    customPassword()
}

exports.genUsername = (callback) => {
    var minLength = 3
    var maxLength = 20
    var ALLOWED_CHARS = /^[a-zA-Z0-9_]+$/

    function validUsername(username) {
        return (username.match(ALLOWED_CHARS) && username.length > minLength && username.length < maxLength)
    }

    function customUsername() {
        var username = ""
        while (!validUsername(username)) {
            generateUsername.setSeperator('_')
            username = generateUsername.generate()
        }
        callback(null, username)
    }
    customUsername()
}

exports.genEmail = (callback) => {
    callback(null, generateEmail( {domain : 'matcha.com'} ))
}

exports.genAge = (callback) => {
    maxAge = 50
    minAge = 18
    callback(null, Math.floor(Math.random() * (maxAge - minAge)) + minAge)
}

exports.genBio = (callback) => {
    callback(null, generateSentence({min: 4, max: 7}))
}

exports.genName = (callback) => {
    var chance = new Chance
    callback(null, chance.first())
}

exports.genSurname = (callback) => {
    var chance = new Chance
    callback(null, chance.last())
}

exports.genSex = (callback) => {
    var gender = ["male", "female"]
    callback(null, gender[Math.floor(Math.random() * 2)])

}

exports.genOrientation = (callback) => {
    var orientation = ["heterosexual", "homosexual", "bisexual"]
    callback(null, orientation[Math.floor(Math.random() * 3)])
}

exports.genPreference = (callback) => {
    var preference = ["men", "women", "both"]
    callback(null, preference[Math.floor(Math.random() * 3)])
}

exports.genInterests = (callback) => {
    var interests = ""
    var chance = new Chance

    for (i = 0; i < (Math.floor(Math.random() * (4 - 1)) + 1); i++)
    {
        if (i > 0) {
            interests += ","
        }
        interests += chance.animal({type: 'pet'}).toLowerCase()
    }
    callback(null, interests)
}

exports.genPlaces = (rows, callback) => {
    https.get(`https://data.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000%40public&rows=${rows}&facet=country&refine.country=South+Africa`, (res) => {
		let data = ''
		res.on('data', (chunk) => {
			data += chunk
		})
		res.on('end', () => {
            let parsed = JSON.parse(data)
            let hits = parsed.nhits
            let promise = new Promise ((resolve, reject) => {
                var i
                for(i = 0; i < hits && i < rows; i++) {
                    let city = parsed.records[i].fields.name
                    let country = parsed.records[i].fields.country
                    let latitude = parsed.records[i].fields.latitude
                    let longitude = parsed.records[i].fields.longitude
                    let params = ['latitude', 'longitude', 'city', 'country']
                    let vals = [latitude, longitude, city, country]
                    let valid = new Promise((y, n) => {
                        Q.fetchone("places", ['id'], 'city', city, (err, res) => {
                            if (err) {
                                callback("places generator mySQL query error " + err, null)
                            }
                            else if (res && res.length > 0) {
                                n(0)
                            }
                            else {
                                y(1)
                            }
                        })
                    })
                    valid.then(proceed => {
                        if (proceed === 1) {
                            Q.insert("places", params, vals, (err, res) => {
                                if (err) {
                                    callback("places table insertion error " + err, null)
                                }
                            })
                        }
                    }).catch(err => { callback("places table query error " + err, null) })
                }
                if (i === rows || i === hits) {
                    resolve("places loaded")
                }
            })
            promise.then(status => {
                callback(null, status)
            }).catch(err => callback(err, null))
        })
	}).on("error", (err) => { callback("Geonames API error: " +err, null) })
}

exports.genPlace = (username, callback) => {
    let promise = new Promise((res, rej) => {
        Q.countRows('places',(error, result) => {
            if (error) {
                callback(error, null)
            }
            else {
                res(result)
            }
        })
    })
    promise.then(count => {
        index = Math.floor(Math.random() * (count)) + 1
        let params = ['latitude', 'longitude', 'city', 'country']
        let place = new Promise((found, notfound) => {
            Q.fetchone("places", params, 'id', index, (err, res) => {
                if (err) {
                    callback(err, null)
                }
                else if (res && res.length > 0){
                   found(res)
                }
            })
        })
        place.then(res => {
            let location = {
            city : res[0].city,
            country : res[0].country,
            latitude : res[0].latitude,
            longitude : res[0].longitude
            }
            let creation = new Promise((y, n) => {
                Geo.create(username, location.latitude, location.longitude, location.city, location.country, (err, result) => {
                    if (err) {
                        callback(err, null)
                    }
                    else {
                        y(location)
                    }
                })

            })
            creation.then(outcome => {
                callback(null, outcome)
            }).catch(err => { callback(err, null) })
        })
        
    })
}

exports.calculateDistance = (user, others, callback) => {
    let userLocation = new Promise ((res, rej) => {
        params = ['latitude', 'longitude', 'city', 'country']
        Q.fetchone("geolocation", params, 'username', user, (err, result) => {
            if (err) {
                callback(err, null)
            }
            else if (result && result.length > 0) {
                const L1 = {
                    latitude: result[0].latitude,
                    longitude: result[0].longitude,
                    gender: others[0].gender,
                    orientation: others[0].orientation,
                    interests: others[0].interests.split(',')
                }
                res(L1)
            }
        })
    })
    userLocation.then(loc => {
        let distCalc = new Promise((y, n) => {
            var i
            for (i = 1; i < others.length; i++) {
            setTimeout((i) => {
                let otherLocation = new Promise((resolve, reject) => {
                    let locationObject = {
                        username: others[i].username,
                        gender: others[i].gender,
                        orientation: others[i].orientation,
                        interests: others[i].interests.split(','),
                        commonInterestsCount: 0,
                        //commonInterests: [],
                        city: null,
                        country: null,
                        distance : null,
                        blocked : 0,
                        suspended : parseInt(others[i].suspended),
                        suitable : null,
                        popularity : others[i].popularity
                    }
                    Q.fetchone("geolocation", ['latitude', 'longitude', 'city', 'country'], 'username', others[i].username, (err, result) => {
                        if (err) {
                            callback(err, null)
                        }
                        else if (result && result.length > 0) {
                            let L2 = {
                                latitude: result[0].latitude,
                                longitude: result[0].longitude,
                            }
                            locationObject.city = result[0].city
                            locationObject.country = result[0].country
                            locationObject.distance = Math.floor(randomLocation.distance(loc, L2)) / 1000
                            let blockedStatus = new Promise((res, rej) => {
                                let table = 'blocked'
			                    let params = ['blocker', 'username']
			                    B.checkstat(user, locationObject.username, table, params, (err, result) => {
                                    if (err) {
                                        console.log("blocked status check error : ", err)
                                    }
                                    else {
                                        let suitability = new Promise ((win, lose) => {
                                            if ((loc.orientation === 'bisexual') ||
                                                    (loc.orientation === 'gay' && others[i].orientation === 'gay') ||
                                                        (loc.orientation === 'lesbian' && others[i].orientation === 'lesbian') || 
                                                            (loc.orientation === 'straight' && loc.gender === 'male' && others[i].gender === 'female' && (others[i].orientation === 'straight' || others[i].orientation === 'bisexual')) ||
                                                                (loc.orientation === 'straight' && loc.gender === 'female' && others[i].gender === 'male' && (others[i].orientation === 'straight' || others[i].orientation === 'bisexual'))) {
                                                locationObject.suitable = 1
                                                let common = new Promise((w, l) => {
                                                    for(let j in loc.interests) {  
                                                        if(locationObject.interests.indexOf(loc.interests[j]) > -1){
                                                            locationObject.commonInterestsCount++
                                                            //locationObject.commonInterests.push(loc.interests[j])
                                                            //console.log(loc.interests[j])
                                                        }
                                                    }
                                                    w(locationObject)
                                                })
                                                common.then(locationObject => {
                                                    win(locationObject)
                                                })
                                            }
                                            else {
                                                locationObject.suitable = 0
                                                win(locationObject)
                                            }
                                        })
                                        suitability.then(locationObject => {
                                            locationObject.blocked = JSON.parse(result).status
                                            res(locationObject)
                                        }).catch(err => { callback(err, null) })
                                    }
                                })
                            })
                            blockedStatus.then(locationObject => {
                                resolve(locationObject)
                            }).catch(err => callback(err, null))
                        }
                        else {
                            reject(-1)
                        }
                    })
                })
                otherLocation.then(locationObject => {
                    let table = new Promise((resolve, reject) => {
                        var sql = 
                        `CREATE TABLE IF NOT EXISTS ${user} (` +
                        " `id` int(11) NOT NULL AUTO_INCREMENT," +
                        " `username` varchar(20) NOT NULL," +
                        " `gender` varchar(20) NOT NULL," +
                        " `distance` int(6)," +
                        " `city` varchar(42)," +
                        " `country` varchar(42)," +
                        " `blocked` int(1) NOT NULL," +
                        " `suspended` int(1) NOT NULL," +
                        " `suitable` int(1) NOT NULL," +
                        " `popularity` int(2) NOT NULL," +
                        " `sharedInterestsCount` int(3) NOT NULL," +
                        //" `sharedInterests` varchar(140)," +
                        " PRIMARY KEY (`id`)" +
                        ") ENGINE=InnoDB"
                        conn.query(sql, (err, res) => {
                            if (err) {
                                reject(err)
                            }
                            else {
                                resolve(locationObject)
                            }
                        })
                    })
                   table.then(locationObject => {
                    Q.fetchone(user, ['id'], 'username', locationObject.username, (err, result) => {
                        params = ['username', 'gender', 'distance', 'city', 'country', 'blocked', 'suspended', 'suitable', 'popularity', 'sharedInterestsCount'/*, 'sharedInterests'*/]
                        vals = [locationObject.username, locationObject.gender, locationObject.distance, locationObject.city, 
                            locationObject.country, locationObject.blocked, locationObject.suspended, locationObject.suitable, 
                            locationObject.popularity, locationObject.commonInterestsCount]
                        if (result && result.length > 0) {
                            Q.update(user, params, vals, 'username', locationObject.username, (err, res) => {
                                if (err) {
                                    callback(err, null)
                                }
                                else {
                                    
                                }
                            })
                        }
                        else {
                            Q.insert(user, params, vals, (err, res) => {
                                if (err)
                                    console.log(err)
                               else {
                                   
                                }
                            })
                        }
                    })
                   }).catch(err => { callback(err, null) })
                }).catch(err => { callback(err, null) })
                otherLocation.then( () => {
                    if (i === others.length - 1) {
                        y("finished")
                    }
                })

            }, (i + 1) * 10, i)
            }
        })
        distCalc.then(result => {
            setTimeout(() => {
                callback(null, result)
            }, 10)
        }).catch(err => { callback(err, null) })
    }).catch(err => { callback(err, null) })
}