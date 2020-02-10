const R = require('ramda')
const nodemailer = require('nodemailer')
const { email: config } = require('../config')

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.credentials.username,
    pass: config.credentials.password
  }
})

const send = ({ to, subject, body, attachments }) => new Promise((resolve, reject) =>
  transport.sendMail(
    {
      from: config.credentials.username,
      html: body,
      subject,
      to,
      attachments
    },
    err => err ? reject(err) : resolve(console.log(`Sent successfully to ${to}`))
  )
)

const sendBatch = R.pipeP(
  R.pipe(
    R.map(send),
    R.bind(Promise.all, Promise)
  ),
  R.prop('length')
)
module.exports = {
  send,
  sendBatch
}
