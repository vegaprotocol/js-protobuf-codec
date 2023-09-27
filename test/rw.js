const reader = require('../decode/reader.js')
const Writer = require('../encode/writer.js')
const encoding = require('../encode/types.js')
const decoding = require('../decode/types.js')

const test = require('tape')

test('double regression', (assert) => {
  const w = new Writer()

  w.fixed64(1n, 1 / 3, encoding.double)

  const r = reader(w.concat())

  assert.equal(1 / 3, decoding.double(r.next().value[1].data))

  assert.end()
})
