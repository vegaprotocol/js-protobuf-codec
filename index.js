module.exports = {
  encode: {
    Writer: require('./encode/writer.js'),
    types: require('./encode/types.js'),
    wireTypes: require('./encode/wire-types.js')
  },
  decode: {
    reader: require('./decode/reader.js'),
    types: require('./decode/types.js'),
    wireTypes: require('./decode/wire-types.js')
  }
}
