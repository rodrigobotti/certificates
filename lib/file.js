const fs = require('fs')

const loadBase64Sync = path => fs.readFileSync(path, { encoding: 'base64' })
const loadContentSync = path => fs.readFileSync(path, { encoding: 'utf8' })

module.exports = {
  loadBase64Sync,
  loadContentSync
}
