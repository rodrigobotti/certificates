const R = require('ramda')
const { email: { content: config } } = require('../config')

const parse = ({ firstname, lastname, email }) => ({ email, name: `${firstname} ${lastname}` })

const buildEmail = R.curry((name, email, attachment) => ({
  to: email,
  subject: config.subject,
  body: config.body(name),
  attachments: [{
    content: attachment,
    filename: config.attachment,
    contentType: 'application/pdf'
  }]
}))

module.exports = {
  parse,
  buildEmail
}
