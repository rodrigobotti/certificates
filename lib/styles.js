const R = require('ramda')

const serialize = R.pipe(
  R.toPairs,
  R.map(([name, value]) => [`${name}: ${value}`]),
  R.reduce(R.concat, []),
  R.join('; '),
  R.concat(R.__, ';')
)

module.exports = {
  serialize
}
