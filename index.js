require('dotenv').config({})

const { createReadStream } = require('fs')
const { join } = require('path')

const R = require('ramda')
const _ = require('highland')
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
const FILE_IMAGE_CERTIFICATE_NAME = 'certificate.jpg'
const FILE_TEMPLATE_NAME = 'certificate-template.html'

const PLACEHOLDER_TEMPLATE_IMAGE = '{{ background_image }}'
const PLACEHOLDER_TEMPLATE_STYLE_NAME = '{{ name_style }}'
const PLACEHOLDER_TEMPLATE_NAME = '{{ name }}'

const IMAGE_CERTIFICATE_CONTENT = loadBase64Sync(assetPath(FILE_IMAGE_CERTIFICATE_NAME))
const TEMPLATE_CERTIFICATE_CONTENT = loadContentSync(assetPath(FILE_TEMPLATE_NAME))
const STYLE_NAME_CONTENT = serialize(config.styles.name)

const BASE_CERTIFICATE_TEMPLATE = TEMPLATE_CERTIFICATE_CONTENT
  .replace(PLACEHOLDER_TEMPLATE_IMAGE, IMAGE_CERTIFICATE_CONTENT)
  .replace(PLACEHOLDER_TEMPLATE_STYLE_NAME, STYLE_NAME_CONTENT)

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
  _
)

const sendEmails = R.pipe(sendBatch, _)

const start = Date.now()

_(source)
  .through(parser)
  .filter(R.propEq('present', 'x'))
  .map(parse)
  .batch(config.batch)
  .flatMap(buildEmailMessages)
  .flatMap(sendEmails)
  .tap(size => console.log(`Finished processing ${size} attendees`))
  .reduce(0, R.add)
  .errors(console.error)
  .tap(total => `Finished processing ${total} attendees`)
  .done(total => console.log(`Process finished in ${moment.duration(Date.now() - start).asMinutes()}m`))
