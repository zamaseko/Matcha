const conf = require('../config/emailconfig')
const pvt = require('../config/emailconfig')
const nodemailer = require('nodemailer')

const email = nodemailer.createTransport(conf)

module.exports = email
