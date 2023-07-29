import protos from '../index.js'
import test from 'tape'

test('identity for esm', assert => {
  const writer = new protos.encode.Writer()
  writer.varint(1, 2n)
  const reader = protos.decode.reader(writer.concat())

  for (const [fieldNumber, { data }] of reader) {
    assert.equal(fieldNumber, 1)
    assert.equal(data, 2n)
  }

  assert.end()
})
