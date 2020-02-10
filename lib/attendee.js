const R = require('ramda')
const { email: { content: config } } = require('../config')

const NAME_TO_IGNORE = 'GDG Campinas'

const capitalize = R.converge(
  R.concat,
  [R.pipe(R.head, R.toUpper), R.pipe(R.tail, R.toLower)]
)

const comparableName = R.pipe(
  R.toLower,
  R.trim
)

const toName = R.pipe(
  R.uniqBy(comparableName),
  R.map(R.when(
    R.equals(NAME_TO_IGNORE),
    R.always('')
  )),
  R.map(R.split(' ')),
  R.flatten,
  R.map(capitalize),
  R.join(' '),
  R.trim
)

const getActualLastName = (firstname, lastname) =>
  comparableName(firstname).endsWith(comparableName(lastname)) ||
  comparableName(firstname) === comparableName(lastname)
    ? ''
    : lastname

const parse = ({ firstname, lastname, email }) => ({
  email,
  name: toName([ firstname, getActualLastName(firstname, lastname) ])
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
