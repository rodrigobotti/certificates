require('dotenv').config({})

const { createReadStream, promises: { writeFile } } = require('fs')
const { join } = require('path')

const R = require('ramda')
const H = require('highland')
const csv = require('csv-parse')
const moment = require('moment')

const config = require('./config')
const { loadBase64Sync, loadContentSync } = require('./lib/file')
const { serialize } = require('./lib/styles')
const { convert } = require('./lib/pdf')
const { sendBatch } = require('./lib/email')
const { parse, buildEmail } = require('./lib/attendee')

const assetPath = fileName => join(config.assets.dirPath, fileName)

const FILE_CSV_NAME = 'attendees.csv'
const CSV_PARSE_DELIMITER = ','
const FILE_IMAGE_CERTIFICATE_NAME = 'certificate.png'
const FILE_TEMPLATE_NAME = 'certificate-template.html'

const PLACEHOLDER_TEMPLATE_IMAGE = '{{ background_image }}'
const PLACEHOLDER_TEMPLATE_STYLE_NAME = '{{ name_style }}'
const PLACEHOLDER_TEMPLATE_NAME = '{{ name }}'

const IMAGE_CERTIFICATE_CONTENT = loadBase64Sync(assetPath(FILE_IMAGE_CERTIFICATE_NAME))
const TEMPLATE_CERTIFICATE_CONTENT = loadContentSync(assetPath(FILE_TEMPLATE_NAME))
const STYLE_NAME_CONTENT = serialize(config.styles.name)

const baseTemplate = R.pipe(
  R.replace(PLACEHOLDER_TEMPLATE_IMAGE, IMAGE_CERTIFICATE_CONTENT),
  R.replace(PLACEHOLDER_TEMPLATE_STYLE_NAME, STYLE_NAME_CONTENT)
)

const BASE_CERTIFICATE_TEMPLATE = baseTemplate(TEMPLATE_CERTIFICATE_CONTENT)

const source = createReadStream(assetPath(FILE_CSV_NAME))

const parser = csv({
  delimiter: CSV_PARSE_DELIMITER,
  columns: R.identity
})

const buildEmailMessage = ({ name, email }) =>
  convert(BASE_CERTIFICATE_TEMPLATE.replace(PLACEHOLDER_TEMPLATE_NAME, name))
    .then(buildEmail(name, email))

const buildEmailMessages = R.pipe(
  R.map(buildEmailMessage),
  R.bind(Promise.all, Promise),
  H
)

const sendEmails = R.pipe(
  sendBatch,
  H
)

const writeFS = R.curry((filename, content) =>
  writeFile(filename, content, { encoding: 'utf8' })
)

const saveAttachment = email => R.pipe(
  R.path(['attachments', 0, 'content']),
  writeFS(join(config.assets.dirPath, 'debug', `${email.to}.pdf`))
)(email)

const then = fn => p =>
  p.then(fn)

const saveAttachments = R.pipe(
  R.map(saveAttachment),
  R.bind(Promise.all, Promise),
  then(R.prop('length')),
  H
)

const isPresent = R.propSatisfies(R.complement(R.isNil), 'checkin')

// const compareAttendees = (a, b) => a.email === b.email

const isDebugMode = R.always(config.debug)

const start = Date.now()

H(source)
  .through(parser)
  .filter(isPresent)
  // .uniqBy(compareAttendees)
  .map(parse)
  .batch(config.batch)
  .flatMap(buildEmailMessages)
  .flatMap(R.ifElse(
    isDebugMode,
    saveAttachments,
    sendEmails
  ))
  .tap(size => console.log(`Finished processing ${size} attendees`))
  .reduce(0, R.add)
  .errors(console.error.bind(console))
  .tap(total => `Finished processing ${total} attendees`)
  .done(_total => console.log(`Process finished in ${moment.duration(Date.now() - start).asMinutes()}m`))
