import Writer from "../encode/writer.mjs"
import test from 'tape'

test('', (assert) => {
  assert.equal(new Writer().concat().byteLength, 0)
  assert.equal(new Writer(0).concat().byteLength, 0)

  const w = new Writer(127)
  w.alloc(128)
  assert.equal(w.concat().byteLength, 128)
  assert.equal(w.pages, 1)

  const w2 = new Writer(127)
  w2.alloc(128)
  w2.alloc(128)
  assert.equal(w2.concat().byteLength, 256)
  assert.equal(w2.pages, 1)

  const w3 = new Writer(512)
  w3.alloc(128)
  w3.alloc(128)
  assert.equal(w3.concat().byteLength, 256)
  assert.equal(w3.pages, 1)

  assert.end()
})
