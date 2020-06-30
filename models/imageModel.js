const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		const tempPath = path.join(__dirname, '../public/uploads')
		if (!fs.existsSync(tempPath)) {
			fs.mkdirSync(tempPath)
			fs.mkdirSync(path.join(tempPath, 'temp'))
		}
		else if (!fs.existsSync(path.join(tempPath, 'temp'))) {
			fs.mkdirSync(path.join(tempPath, 'temp'))
		}
		var dest = 'uploads/temp'
		callback(null, 'public/'+dest)
	},
	filename: (req, file, callback) => {
		var save = `${req.session.user}`
		callback(null, save)
	}
})

const upload = multer({ storage: storage })

module.exports = upload
