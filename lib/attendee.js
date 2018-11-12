const R = require('ramda')
const { email: { content: config } } = require('../config')

const NAME_TO_IGNORE = 'GDG Campinas'

const capitalize = R.converge(
  R.concat,
  [R.pipe(R.head, R.toUpper), R.pipe(R.tail, R.toLower)]
)

const toName = R.pipe(
  R.map(R.ifElse(R.equals(NAME_TO_IGNORE), _ => '', capitalize)),
  R.join(' '),
  R.trim
)

const parse = ({ firstname, lastname, email }) => ({
  email,
  name: toName([firstname, lastname])
})

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
