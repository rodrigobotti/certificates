const pdf = require('html-pdf')
const { pdf: config } = require('../config')

const convert = html => new Promise((resolve, reject) => pdf.create(html, config)
  .toBuffer((err, content) => err ? reject(err) : resolve(content))
)

module.exports = {
  convert
}
