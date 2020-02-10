const pdf = require('html-pdf')
const { pdf: config } = require('../config')

const convert = html => new Promise((resolve, reject) =>
  pdf.create(html, config)
    .toBuffer((error, content) => error ? reject(error) : resolve(content))
)

module.exports = {
  convert
}
